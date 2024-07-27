-- now, we will have a quite simple table here, hope every database engine copes
-- well with this one

create table todos
(
    id          integer primary key,
    description text      not null,
    done        boolean   not null default false,
    created     timestamp not null default now()
);
