
insert into card (crd_name, crd_url, crd_cost, crd_health, crd_attack, crd_cardtype_id) values('Paper','./images/Paper.png', 1, 2, 2, 1);
insert into card (crd_name, crd_url, crd_cost, crd_health, crd_attack, crd_cardtype_id) values('Rubber','./images/Rubber.png', 1, 3, 1, 1);
insert into card (crd_name, crd_url, crd_cost, crd_health, crd_attack, crd_cardtype_id) values('Pencil','./images/Pencil.png', 1, 1, 3, 1);
insert into card (crd_name, crd_description, crd_url, crd_cost, crd_health, crd_attack, crd_cardtype_id) values('Sticker','Gives +2hp to a random friendly unit on the board', './images/Sticker.png', 1, 1, 1, 2);
insert into card (crd_name, crd_url, crd_cost, crd_health, crd_attack, crd_cardtype_id) values('Pen','./images/Pen.png', 2, 3, 3, 1);
insert into card (crd_name, crd_url, crd_cost, crd_health, crd_attack, crd_cardtype_id) values('MechanicalPencil','./images/MechanicalPencil.png', 2, 4, 2, 1);
insert into card (crd_name, crd_description, crd_url, crd_cost, crd_health, crd_attack, crd_cardtype_id) values('Clipper','Gives +2atk to a random friendly unit on the board', './images/Clipper.png', 1, 1, 1, 2);
insert into card (crd_name, crd_description, crd_url, crd_cost, crd_health, crd_attack, crd_cardtype_id) values('Charger','Gives +3 atk and +3 hp to a random friendly unit on the board', './images/Charger.png', 1, 2, 1, 2);



insert into player (ply_name,ply_passwd) values ('tester1','test1234');
insert into player (ply_name,ply_passwd) values ('tester2','test1234');

insert into pmstate (pms_name) values ('PlayCard');
insert into pmstate (pms_name) values ('Attack');
insert into pmstate (pms_name) values ('Endturn');
insert into pmstate (pms_name) values ('Wait');

insert into cardpos (cp_name) values ('Hand');
insert into cardpos (cp_name) values ('Table');
insert into cardpos (cp_name) values ('TablePlayed');

insert into cardtype (cardtype_name) values ('Unit');
insert into cardtype (cardtype_name) values ('Buff');
insert into cardtype (cardtype_name) values ('Spell');

commit;
