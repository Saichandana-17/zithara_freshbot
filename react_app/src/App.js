import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      title: 'Zithara Application',
      isAdded: false,
      addedCustomerName: '',
      customers: [],
      currentPage: 1,
      customersPerPage: 20,
      searchValueCustomer: '',
      searchValueLocation: '',
      sortBy: 'date',
      showAdd: false,
      showView: false,
    };
  }

  componentDidMount() {
    console.log('COMPONENT MOUNTED');
    this.fetchCustomerData();
  }

  fetchCustomerData = () => {
    fetch('http://localhost:3000/api/db_info')
      .then(response => response.json())
      .then(data => this.setState({ customers: data }))
      .catch(err => console.error('Error fetching data:', err));
  };

  addName = async (event) => {
    event.preventDefault();

    const cust_data = {
      sno: this.refs.sno.value,
      cust_name: this.refs.cust_name.value,
      age: this.refs.age.value,
      phone: this.refs.phone.value,
      location: this.refs.location.value,
      created_at: this.refs.created_at.value,
    };

    const request = new Request('http://localhost:3000/api/new-customer', {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(cust_data),
    });

    try {
      const response = await fetch(request);

      if (response.ok) {
        this.setState({
          isAdded: true,
          addedCustomerName: cust_data.cust_name,
        });
        this.fetchCustomerData(); // Fetch updated data after adding a new customer
      } else {
        console.error('Error adding customer:', await response.text());
      }
    } catch (err) {
      console.error('Error adding customer:', err);
    }
  };

  handleSearchChangeCustomer = (event) => {
    this.setState({ searchValueCustomer: event.target.value });
  };

  handleSearchChangeLocation = (event) => {
    this.setState({ searchValueLocation: event.target.value });
  };

  handleSortChange = (event) => {
    this.setState({ sortBy: event.target.value }, () => {
      const { sortBy } = this.state;
      let sortedCustomers = [...this.state.customers];

      //Sorting using date and time
      if (sortBy === 'date') {
        sortedCustomers.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      } else if (sortBy === 'time') {
        sortedCustomers.sort((a, b) => {
          const timeA = a.created_at.split('T')[1];
          const timeB = b.created_at.split('T')[1];
          return (timeA && timeB) ? timeA.localeCompare(timeB) : 0;
        });
      }

      this.setState({ customers: sortedCustomers });
    });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  toggleAdd = () => {
    this.setState({ showAdd: !this.state.showAdd });
  };

  toggleView = () => {
    this.setState({ showView: !this.state.showView });
  };

  render() {
    const { title, currentPage, customersPerPage, searchValueCustomer, searchValueLocation, sortBy, showAdd, showView, addedCustomerName } = this.state;

    // Search functionality
    let filteredCustomers = this.state.customers.filter(
      customer =>
        customer.cust_name.toLowerCase().includes(searchValueCustomer.toLowerCase()) &&
        customer.location.toLowerCase().includes(searchValueLocation.toLowerCase())
    );

    // Remove duplicate entries
    filteredCustomers = filteredCustomers.filter((customer, index, self) =>
      index === self.findIndex((t) => (
        t.cust_name.toLowerCase() === customer.cust_name.toLowerCase() && t.location.toLowerCase() === customer.location.toLowerCase()
      ))
    );

    // Pagination
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, Math.min(indexOfLastCustomer, filteredCustomers.length));

    // displaying page numbers
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredCustomers.length / customersPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="App">
        <h1>{title}</h1>
        <div>
          <button onClick={this.toggleAdd}>Add Data</button>
          <button onClick={this.toggleView} style={{ marginLeft: '10px' }}>View Data</button>
        </div>
        {showAdd && (
          <div>
            <form ref="zithForm">
              <input type="text" ref="sno" placeholder="Serial Number" />
              <input type="text" ref="cust_name" placeholder="Customer Name" />
              <input type="text" ref="age" placeholder="Age" />
              <input type="tel" ref="phone" placeholder="Phone Number" />
              <input type="text" ref="location" placeholder="Customer Location" />
              <input type="datetime-local" ref="created_at" placeholder="Time Stamp" />
              <button onClick={this.addName}>Add Customer Data</button>
            </form>
            {this.state.isAdded && (
              <p>{addedCustomerName} data added successfully!</p>
            )}
          </div>
        )}
        {showView && (
          <div>
            <label>
              Search Customer Name:
              <input type="text" value={searchValueCustomer} onChange={this.handleSearchChangeCustomer} />
            </label>
            <label>
              Search Location:
              <input type="text" value={searchValueLocation} onChange={this.handleSearchChangeLocation} />
            </label>
            <label>
              Sort by:
              <select value={sortBy} onChange={this.handleSortChange}>
                <option value="date">Date</option>
                <option value="time">Time</option>
              </select>
            </label>
            <table>
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Customer Name</th>
                  <th>Age</th>
                  <th>Phone Number</th>
                  <th>Customer Location</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.map(customer => (
                  <tr key={customer.sno}>
                    <td>{customer.sno}</td>
                    <td>{customer.cust_name}</td>
                    <td>{customer.age}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.location}</td>
                    <td>{customer.created_at.split('T')[0]}</td>
                    <td>{customer.created_at.split('T')[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div>
              <button
                onClick={() => this.handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
              >
                Previous Page
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => this.handlePageChange(number)}
                  className={currentPage === number ? 'active' : ''}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() =>
                  this.handlePageChange(
                    currentPage < Math.ceil(filteredCustomers.length / customersPerPage)
                      ? currentPage + 1
                      : currentPage
                  )
                }
                disabled={currentPage === Math.ceil(filteredCustomers.length / customersPerPage)}
              >
                Next Page
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;
