package com.hotel.service.impl;

import com.hotel.dto.CustomerDTO;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.model.Customer;
import com.hotel.repository.CustomerRepository;
import com.hotel.service.CustomerService;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for Customer entity operations.
 * Uses Stream API for sorted collections and filtering.
 */
@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll().stream()
                .sorted(Comparator.comparing(Customer::getName))
                .collect(Collectors.toList());
    }

    @Override
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
    }

    @Override
    public List<Customer> searchCustomers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllCustomers();
        }
        return customerRepository.search(query.trim());
    }

    @Override
    public Customer addCustomer(CustomerDTO dto) {
        Customer customer = new Customer();
        customer.setName(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setIdProof(dto.getIdProof());
        customer.setAddress(dto.getAddress());
        return customerRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(Long id, CustomerDTO dto) {
        Customer existing = getCustomerById(id);
        existing.setName(dto.getName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        existing.setIdProof(dto.getIdProof());
        existing.setAddress(dto.getAddress());
        customerRepository.update(existing);
        return existing;
    }

    @Override
    public void deleteCustomer(Long id) {
        getCustomerById(id);
        customerRepository.deleteById(id);
    }
}
