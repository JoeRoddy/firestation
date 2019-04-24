known bugs:
some cross db queries no longer working
bugged: delete from firestore;
insert into db select _ from firestore; // replaces collection names with push ids
insert into firestore select _ from db; broken

working, but create new pushIds:
insert into users select \* from db.users;
insert into firestore.users select \* from db.users;
