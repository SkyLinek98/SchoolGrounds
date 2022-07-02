create table card (
					crd_id SERIAL not null,
					crd_name VARCHAR(60) not null, 	
					crd_description VARCHAR(60), 
					crd_url VARCHAR(60),
					crd_cost INT not null,
					crd_health INT,
					crd_attack INT,
					crd_cardtype_id INT not null,
					primary key (crd_id)	
);

 create table player (
        	ply_id serial not null,
            ply_name VARCHAR(60),
            ply_passwd VARCHAR(60),
            primary key(ply_id)
    );

 create table match (
        	mt_id serial not null,
            mt_turn INT not null,
			mt_finished boolean not null,
            primary key(mt_id)
    );

 create table pmstate (
        	pms_id serial not null,
            pms_name VARCHAR(60) not null,
            primary key(pms_id)
 );
	
 create table playermatch (
        	pm_id serial not null,
            pm_player_id INT not null,
			pm_match_id INT not null,
			pm_state_id INT not null,
			pm_hp INT not null,
			pm_energy INT not null,
            primary key(pm_id)
    );

create table cardpos (
        	cp_id serial not null,
            cp_name VARCHAR(60) not null,
            primary key(cp_id)
);

create table deck (
        	deck_id serial not null,
            deck_pm_id INT not null,
			deck_pos_id INT not null,
			deck_card_id INT not null,
			deck_card_hp INT not null,
			deck_card_atk INT not null,
            primary key(deck_id)
 );

alter table card 
add constraint crd_fk_cardtype
foreign key (crd_cardtype_id) references cardtype(cardtype_id) 
ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table playermatch 
add constraint pm_fk_player
foreign key (pm_player_id) references player(ply_id) 
ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table playermatch 
add constraint pm_fk_match
foreign key (pm_match_id) references match(mt_id) 
ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table playermatch 
add constraint pm_fk_state
foreign key (pm_state_id) references pmstate(pms_id) 
ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table deck
add constraint deck_fk_pm
foreign key (deck_pm_id) references playermatch(pm_id) 
ON DELETE NO ACTION ON UPDATE NO ACTION;

alter table deck
add constraint deck_fk_pos
foreign key (deck_pos_id) references cardpos(cp_id) 
ON DELETE NO ACTION ON UPDATE NO ACTION;


alter table deck
add constraint deck_fk_card
foreign key (deck_card_id) references card(crd_id) 
ON DELETE NO ACTION ON UPDATE NO ACTION;