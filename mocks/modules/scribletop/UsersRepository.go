// Code generated by mockery v1.0.0. DO NOT EDIT.

package mocks

import (
	scribletop "github.com/scribletop/scribletop-api/modules/scribletop"
	mock "github.com/stretchr/testify/mock"
)

// UsersRepository is an autogenerated mock type for the UsersRepository type
type UsersRepository struct {
	mock.Mock
}

// Delete provides a mock function with given fields: id
func (_m *UsersRepository) Delete(id int) error {
	ret := _m.Called(id)

	var r0 error
	if rf, ok := ret.Get(0).(func(int) error); ok {
		r0 = rf(id)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// FindByEmail provides a mock function with given fields: email
func (_m *UsersRepository) FindByEmail(email string) (*scribletop.UserWithPassword, error) {
	ret := _m.Called(email)

	var r0 *scribletop.UserWithPassword
	if rf, ok := ret.Get(0).(func(string) *scribletop.UserWithPassword); ok {
		r0 = rf(email)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*scribletop.UserWithPassword)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(email)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Validate provides a mock function with given fields: id
func (_m *UsersRepository) Validate(id int) error {
	ret := _m.Called(id)

	var r0 error
	if rf, ok := ret.Get(0).(func(int) error); ok {
		r0 = rf(id)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}
