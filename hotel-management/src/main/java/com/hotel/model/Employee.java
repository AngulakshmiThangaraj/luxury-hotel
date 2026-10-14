package com.hotel.model;

/**
 * Concrete subclass representing hotel staff/personnel.
 * Inherits identity attributes from {@link Person} and adds employment metadata.
 *
 * @author Computer Science & Engineering Department
 * @version 1.0.0
 */
public class Employee extends Person {

    private String employeeCode;
    private String role; // "ADMIN" or "RECEPTIONIST"
    private double salary;

    public Employee() {
        super();
    }

    public Employee(Long id, String name, String email, String phone, String employeeCode, String role, double salary) {
        super(id, name, email, phone);
        this.employeeCode = employeeCode;
        this.role = role;
        this.salary = salary;
    }

    @Override
    public String getRoleTitle() {
        return "Staff Member (" + role + ")";
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public double getSalary() {
        return salary;
    }

    public void setSalary(double salary) {
        if (salary < 0) {
            throw new IllegalArgumentException("Salary cannot be negative.");
        }
        this.salary = salary;
    }
}
