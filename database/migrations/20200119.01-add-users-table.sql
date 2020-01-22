create table users
(
	id serial primary key,
	email varchar(320) unique,
	tag varchar(255) unique,
	password varchar(60),
	created_at timestamp null default now(),
	updated_at timestamp null,
	deleted_at timestamp null
);
