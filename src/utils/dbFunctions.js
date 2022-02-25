import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase("sigthstudy.db");

/**
 * Initialize database.
 */
export async function initDB() {
    // table users
    await _executeSql(
        "create table if not exists user (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nom VARCHAR(25), prenom VARCHAR(25), sex VARCHAR(25), date_de_naissance DATE, distance FLOAT);"
    );
    // table score
    await _executeSql(
        "create table if not exists scores (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, id_user INTEGER, date_score DATE, wich_eye VARCHAR(25), score INTEGER, total_letters INTEGER);"
    );
//table letters
     await _executeSql(
          "create table if not exists letters (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, letter char, score INTEGER, userID INTEGER REFERENCES user(id));"
      );
}

/**
 * Drops database.
 */
export async function dropDB() {
    //await _executeSql("drop table user");
    await _executeSql("drop table scores");
}

/**
 * Private generic function which executes an SQL statement.
 * @param {string} sqlStatement SQL query
 * @param {Array} params SQL query parameters
 * @returns {Promise} Promise which resolves to the result of the query.
 */
function _executeSql(sqlStatement, params = []) {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                sqlStatement,
                params,
                (_, { rows }) => {resolve(rows._array)},
                reject
            );
        });
    });
}

/**
 * Resets database.
 */
export function resetDB() {
    dropDB();
    initDB();
}

/**
 * Gets user.
 *
 * @param {string} nom last name of the user.
 * @param {string} prenom first name of the user.
 * @returns {Promise} Promise reolving to user id or null if user does not exist.
 */
export async function getUser(nom, prenom) {
    if (!nom || !prenom) return null; // return early if null
    const usersWithId = await _executeSql(
        "select id from user where nom=? and prenom=?;",
        [nom, prenom]
    );
    return usersWithId.length ? usersWithId[0].id : null;
}

/**
 * Gets user by id.
 *
 * @param {number} id user id.
 * @returns {Promise} Promise resolving to an array of users.
 */
export async function getUserById(id) {
    return _executeSql("select * from user where id=?;", [id]);
}

/**
 * Gets distance by id.
 *
 * @param {number} id user id.
 * @returns {Promise} Promise resolving to an array of users.
 */
export async function getDistance(id) {
    const result = await _executeSql("select distance from user where id=?;", [
        id
    ]);
    const { distance } = result.length > 0 ? result[0] : null;
    return distance;
}

/**
 * Set distance for a user.
 *
 * @param {number} id_user user id.
 * @param {number} distance left eye score.
 * @returns {Promise} Promise resolving to true if successful.
 */
export async function setDistance(id_user, distance) {
    return _executeSql("update user set distance=? where id=(?);", [
        distance,
        id_user
    ]);
}

/**
 * "Fuzzy search" through users.
 *
 * @param {string} recherche search term.
 * @returns {Promise} Promise resolving to users satisfiying the search terms.
 */
export function getUsersLike(recherche) {
    if (recherche.length > 0) {
        if (recherche.includes(" ")) {
            const recherche1 = recherche.split(" ")[0];
            const recherche2 = recherche.split(" ")[1];
            return _executeSql(
                "select * from user where (nom=? and prenom like ?) or (nom like ? and prenom=?) order by prenom ASC;",
                [recherche1, recherche2 + "%", recherche2 + "%", recherche1]
            );
        } else {
            return _executeSql(
                "select * from user where nom like ? or prenom like ? order by prenom ASC;",
                [recherche + "%", recherche + "%"]
            );
        }
    } else {
        return _executeSql("select * from user order by prenom ASC;", []);
    }
}

/**
 * Gets every user.
 *
 * @returns {Promise} Promise resolving to every user.
 */
export function getUsers() {
    return _executeSql("select * from user order by prenom ASC;", []);
}

/**
 * Adds user.
 *
 * @param {string} nom user's last name.
 * @param {string} prenom user's first name.
 * @param {string} sex user's sex.
 * @param {string} date_de_naissance user's date of birth.
 */
export async function addUser(nom, prenom, sex, date_de_naissance, distance) {
    return await _executeSql("insert into user (nom, prenom, sex, date_de_naissance, distance) values (?,?,?,?,?);",
          [nom, prenom, sex, date_de_naissance, distance]);
}

/**
 * Ajoute une lettre à un utilisateur
 *
 * @param {char} letter: la lettre à ajouter.
 * @param {string} ID: ID du patient associé à la lettre.

 */
export async function addLetter(letter,id) {
      return await _executeSql( "insert into letters (letter, score, userID) values (?,?,?);",
                    [letter,0,id]);
}
/**
 * Removes user by id.
 *
 * @param {number} id user id.
 * @returns {Promise}
 */
export function removeUser(id) {
    return _executeSql("delete from user where id=?;", [id]);
}

/** ADD SCORE TO A USER
 * @param {*} id_user 
 * @param {*} whichEye 
 * @param {*} score 
 * @param {*} nb_letters 
 * @returns 
 */
export function addScore(id_user, whichEye, score, totalLetters) {
    const date = new Date().toISOString();
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql("insert into scores (id_user, date_score, wich_eye ,score, total_letters) values (?,?,?,?,?);",
            [id_user, date, whichEye, score, totalLetters],
                (_, result) => resolve(result),
                (_, err) => reject(err));
        });
    });
   
}



/**
 * Gets score for a user.
 *
 * @param {number} id user id.
 * @returns {Promise} Promise that resolves to score of user `id`.
 */
export function getScore(id) {
    return _executeSql("select * from scores where id_user=? order by date_score ASC", [
        id
    ]);
}

/**
 * Permet de récupérer toutes les informations sur les lettres associées à un patient
 *
 * @param {string} ID: ID du patient.
 */
export function getLetter(id){
 return _executeSql("select * from letters where userID=?", [
        id
    ]);
}

/**
 * Permet de récupérer toutes les lettres associées à un patient par score ascendant
 *
 * @param {string} userID: ID du patient associé à la lettre.

 */
export function getBestLetters(userId){
    return _executeSql("select letter from letters where userID=? ORDER BY score", [
            userId
        ]);
}

/**
 * Permet de récupérer l'ID d'une lettre
 *
 * @param {int} userID: ID du patient associé à la lettre.
 * @param {Char} letter: la lettre recherché .

 */
export function getLetterID(letter,id_user){
 return _executeSql("select id from letters where userID=? AND letter = ?", [
        id_user, letter
    ]);
}

export function getScorebyID(id_user){
 return _executeSql("select sum(score) as total from letters where userID=?", [
        id_user
    ]);
}

/**
 * Permet d'incrémenter de 1 le score d'une lettre
 *
 * @param {int} userID: ID du patient associé à la lettre.

 */
export function updateLetter(id){
 return _executeSql("update letters SET score=score+1 where id=?", [
        id
    ]);
}

/**
 * Permet de trouver un utilisateur à partir de ses informations de base
 * !!! Attention aux cas de doublon !!!
 * @param {string} nom
 * @param {string} prenom
 * @param {string} date
 * @param {int} distance
 */
export function getUserId(nom,prenom,date_de_naissance,distance){
return _executeSql("Select id from user where nom = ? AND prenom = ? AND date_de_naissance = ? AND distance = ?;",
[nom, prenom, date_de_naissance, distance]);
}


export function getScoreLimit(id, nb_lettres, limit = 3) {
    return _executeSql(
        "select * from scores where id_user=? and nb_lettres=? order by date_score ASC limit ?",
        [id, nb_lettres, limit]
    );
}