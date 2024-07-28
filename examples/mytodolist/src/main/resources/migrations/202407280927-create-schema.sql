create table todos
(
    id integer not null primary key auto_increment,
    description text not null,
    done boolean not null default false,
    created timestamp not null default current_timestamp
);
