-- a todos list!
create table todos
(
    id          integer primary key,
    description text      not null,
    done        boolean   not null default false,
    created     timestamp not null default current_timestamp
);
