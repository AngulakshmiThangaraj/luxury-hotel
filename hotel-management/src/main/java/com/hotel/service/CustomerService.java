package com.hotel.service;

import com.hotel.dto.CustomerDTO;
import com.hotel.model.Customer;

import java.util.List;

/**
 * Service interface for Guest/Customer domain logic.
 */
public interface CustomerService {

    List<Customer> getAllCustomers();

    Customer getCustomerById(Long id);

    List<Customer> searchCustomers(String query);

    Customer addCustomer(CustomerDTO dto);

    Customer updateCustomer(Long id, CustomerDTO dto);

    void deleteCustomer(Long id);
}
