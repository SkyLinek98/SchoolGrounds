
insert into card (crd_name, crd_url, crd_cost, crd_health, crd_attack) values('Paper','./images/Paper.png', 1, 2, 2);
insert into card (crd_name, crd_url, crd_cost, crd_health, crd_attack) values('Rubber','./images/Rubber.png', 1, 3, 1);
insert into card (crd_name, crd_url, crd_cost, crd_health, crd_attack) values('Pencil','./images/Pencil.png', 1, 1, 3);
insert into card (crd_name, crd_description, crd_url, crd_cost, crd_health, crd_attack) values('Sticker','Gives +2hp to a random friendly unit on the board', './images/Sticker.png', 1, 2, 1);
insert into card (crd_name, crd_url, crd_cost, crd_health, crd_attack) values('Pen','./images/Pen.png', 2, 3, 3);
insert into card (crd_name, crd_url, crd_cost, crd_health, crd_attack) values('MechanicalPencil','./images/MechanicalPencil.png', 2, 4, 2);

insert into player (ply_name,ply_passwd) values ('tester1','test1234');
insert into player (ply_name,ply_passwd) values ('tester2','test1234');

insert into pmstate (pms_name) values ('PlayCard');
insert into pmstate (pms_name) values ('Attack');
insert into pmstate (pms_name) values ('Endturn');
insert into pmstate (pms_name) values ('Wait');

insert into cardpos (cp_name) values ('Hand');
insert into cardpos (cp_name) values ('Table');
insert into cardpos (cp_name) values ('TablePlayed');

commit;
