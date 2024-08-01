-- here we go
create table todos
(
    id          integer primary key,
    description text      not null,
    done        boolean   not null default false,
    created     timestamp not null default current_timestamp
);

insert into todos(description)
values ('walk dog'),
       ('do the dishes'),
       ('publish npm package');
