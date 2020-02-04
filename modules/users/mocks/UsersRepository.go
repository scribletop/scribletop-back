// Code generated by mockery v1.0.0. DO NOT EDIT.

package mocks

import (
	users "github.com/scribletop/scribletop-api/modules/users"
	mock "github.com/stretchr/testify/mock"
)

// UsersRepository is an autogenerated mock type for the UsersRepository type
type UsersRepository struct {
	mock.Mock
}

// FindByEmail provides a mock function with given fields: tag
func (_m *UsersRepository) FindByEmail(tag string) (*users.UserWithPassword, error) {
	ret := _m.Called(tag)

	var r0 *users.UserWithPassword
	if rf, ok := ret.Get(0).(func(string) *users.UserWithPassword); ok {
		r0 = rf(tag)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*users.UserWithPassword)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(tag)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}
