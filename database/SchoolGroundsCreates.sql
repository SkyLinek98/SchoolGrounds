CREATE TABLE card (
    card_id SERIAL,
    card_name VARCHAR(80),
    card_description VARCHAR(200),
	card_type INT not null,
    card_quantity INT not null,
	card_cost INT not null,
	card_health INT not null,
	card_attack INT not null,
PRIMARY KEY(card_id)
    );


CREATE TABLE cardtype (
    type_id SERIAL,
    card_id INT not null,
    type_text VARCHAR(50),
PRIMARY KEY(type_id)
    );


alter table cardtype
add constraint cardtype_fk_card
foreign key (card_id) references card(card_id)
ON DELETE NO ACTION ON UPDATE NO ACTION;



CREATE TABLE user (
    user_id SERIAL,
    user_name VARCHAR(80),
    user_password VARCHAR(200),
PRIMARY KEY(user_id)
    );

CREATE TABLE registereduser (
    registereduser_id SERIAL,
    registereduser_name VARCHAR(80),
    registereduser_password VARCHAR(200),
PRIMARY KEY(registereduser_id)
    );