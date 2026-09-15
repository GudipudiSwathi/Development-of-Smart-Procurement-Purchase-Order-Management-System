package com.eps.enterpriseprocurementsystem.exception;

public class DepartmentAlreadyExistsException extends RuntimeException {

    public DepartmentAlreadyExistsException(String message) {
        super(message);
    }
}