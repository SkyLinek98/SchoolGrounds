var pool = require('./connection.js')

// This probably would make more sense in a matchesModel (and probably some other)
module.exports.getPlayersOfMatch = async function (mId) {
    try {
        let sqlCheck = `select * from playermatch
                        where pm_match_id = $1`;
        let resCheck = await pool.query(sqlCheck, [mId]);
        return { status: 200, result: resCheck.rows };
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}


module.exports.getMatchOfPlayer = async function (pmId) {
    try {
        let sqlCheck = `select * from match,playermatch
    where pm_id = $1 and pm_match_id = mt_id`;
        let resCheck = await pool.query(sqlCheck, [pmId]);
        if (resCheck.rows.length == 0)
            return { status: 400, result: { msg: "That player is not on a match" } };
        return { status: 200, result: resCheck.rows[0] };
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}


module.exports.getPlayerMatch = async function (pmId) {
    try {
        let sqlCheck = `select * from playermatch
    where pm_id = $1`;
        let resCheck = await pool.query(sqlCheck, [pmId]);
        if (resCheck.rows.length == 0)
            return { status: 400, result: { msg: "That player does not exist" } };
        return { status: 200, result: resCheck.rows[0] };
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}

module.exports.getPlayerDeckCard = async function (pmId, deckId, ownerName) {
    if (!ownerName) ownerName = "player";
    try {
        let sqlCheckDeck = `select deck_id, deck_pm_id, deck_pos_id, deck_card_id, deck_card_hp, deck_card_atk,
        crd_name, crd_cost, crd_cardtype_id
        from deck, card
            where deck_id = $1
            and deck_pm_id = $2
            and deck_card_id = crd_id`;
        let resCheckDeck = await pool.query(sqlCheckDeck, [deckId, pmId]);
        if (resCheckDeck.rows.length == 0)
            return { status: 400, result: { msg: "Card not owned by the "+ownerName } };
        return {status: 200, result: resCheckDeck.rows[0]};
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}

module.exports.getPlayerRandomDeckCard = async function (pmId) {
    try {
        let sqlCheckDeck = `select * from deck
        where deck_pm_id = $1 and
        (deck_pos_id = 2 or deck_pos_id = 3)
        order by random()
        limit 1`;
        let resCheckDeck = await pool.query(sqlCheckDeck, [pmId]);
        if (resCheckDeck.rows.length == 0)
            return { status: 400, result: { msg: "No friendly units on the board"} };
        return {status: 200, result: resCheckDeck.rows[0]};
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}

module.exports.applyPlayerBuffCard = async function (targetId, buffId) {
    try {
        let sql
            if (buffId == 4){
                sql = `update deck set deck_card_hp = deck_card_hp + 2 where deck_id = $1`;
            }else if (buffId == 7){
                sql = `update deck set deck_card_atk = deck_card_atk + 2 where deck_id = $1`;
            }else if (buffId == 8){
                sql = `update deck set deck_card_atk = deck_card_atk + 3, deck_card_hp = deck_card_hp + 3 where deck_id = $1`;
            }
        let res = await pool.query(sql, [targetId]);
        return {status: 200, result: res.rows[0]};
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}


module.exports.getOpponent = async function (pmId, matchId) {
    try {
        let sqlCheckOp = `select * from playermatch 
                          where pm_match_id = $1
                          and pm_id != $2`;
        let resCheckOp = await pool.query(sqlCheckOp, [matchId, pmId]);
        if (resCheckOp.rows.length == 0)  
            return { status: 400, result: { msg: "That match is missing an opponent" } };
        return { status:200, result:resCheckOp.rows[0] };
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}

module.exports.getMatchByID = async function (matchId) {
    try {
        let sqlGetMatch = `select * from match 
                          where mt_id = $1`;
        let resGetMatch = await pool.query(sqlGetMatch, [matchId]);
        if (resGetMatch.rows.length == 0)  
            return { status: 400, result: { msg: "That match is missing" } };
        return { status:200, result:resGetMatch.rows[0] };
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}


// TODO: 
// Receive player Id and check if corresponds to the pmId
// Check if match has ended
module.exports.attackPlayer = async function (pmId, deckId) {
    try {
        let res;
        // get player match info 
        res = await this.getPlayerMatch(pmId);
        if (res.status != 200) return res;
        
        let player = res.result;
        if (player.pm_state_id != 2)
            return { status: 400, result: { msg: "You cannot attach at this moment" } };
        
        // get player deck card info
        res = await this.getPlayerDeckCard(pmId,deckId)
        if (res.status != 200) return res;
        let card = res.result;
        if (card.deck_pos_id != 2)
            return { status: 400, result: { msg: "The card cannot attack at this moment" } };
        // get opponent info
        let matchId = player.pm_match_id;
        res = await this.getOpponent(pmId,matchId);
        if (res.status != 200) return res;
        let opponent = res.result;
        let opPmId = opponent.pm_id;
        // check if opponent deck has no cards on the table with hp>0
        let sqlCheckOpDeck = `select * from deck 
                             where deck_pm_id = $1
                             and (deck_pos_id = 2 or deck_pos_id = 3) 
                             and deck_card_hp > 0`;
        let resCheckOpDeck = await pool.query(sqlCheckOpDeck, [opPmId]);
        if (resCheckOpDeck.rows.length != 0)
            return {status: 400, result: {msg: "Cannot attack opponent, some cards still have HP left"}}; 
        // Mark the card as "TablePlayed"
        let sqlUpPos = `update deck set deck_pos_id = 3
                        where deck_id = $1`
        await pool.query(sqlUpPos, [deckId]);
        
        // remove hp from opponent life
        let cardAttack = card.deck_card_atk;
        let sqlUpHp = `update playermatch set pm_hp = pm_hp - $1
                        where pm_id = $2`
        await pool.query(sqlUpHp, [cardAttack,opPmId]);
        return {status:200, result: {msg: "Successfully removed "+cardAttack+" HP from the opponent's life"}}
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }

}


module.exports.endTurn = async function (pmId) {
    try {
        let res;
        // get player match info 
        res = await this.getPlayerMatch(pmId);
        if (res.status != 200) return res;
        let player = res.result;
      //  if (player.pm_state_id != 1 || 2)
        //    return { status: 400, result: { msg: "You cannot end turn at this moment" } };

        // get opponent info
        let matchId = player.pm_match_id;
        res = await this.getOpponent(pmId,matchId);
        if (res.status != 200) return res;
        let opponent = res.result;

        // get match info
        res = await this.getMatchByID(matchId);
        if (res.status != 200) return res;
        let match = res.result;
        let energyReset = TurnToEnergy(match.mt_turn)
        
        //Test for dead player
        if (opponent.pm_hp <= 0 || player.pm_hp <= 0) {     
            let sqlEnd = `Update match set mt_finished = true
                        Where mt_id = $1`;
            await pool.query(sqlEnd, [matchId]);
            return { status: 200, result: { msg: "Game Ended" } };
        } else{

            
        // reset attack of the player cards on the table
        let sqlResetAttack = `update deck set deck_pos_id = 2 
                       where deck_pos_id = 3 and deck_pm_id = $1`;
        await pool.query(sqlResetAttack, [pmId]);

        // delete all cards that died from both players in the match
        // Cards on the hand have full HP so no need to check the card position
                let sqlDeck = `delete from deck 
                           where (deck_pm_id = $1 or deck_pm_id = $2)  
                           and deck_card_hp <= 0`;
                await pool.query(sqlDeck, [pmId, opponent.pm_id]);

        // Discard all cards that remained in the hand
                let sqlDiscard = `delete from deck 
                           where (deck_pm_id = $1)  
                           and deck_pos_id = 1`;
                await pool.query(sqlDiscard, [pmId]);

        // Set player match states
        let sqlUpState = `update playermatch set pm_state_id = $1, pm_energy = $2
                          where pm_id = $3`;
        // the opponent has not yet played
        if (opponent.pm_state_id == 4) {
            // change state of player to EndTurn
            await pool.query(sqlUpState, [3, energyReset, pmId]);
            // change state of opponent to PlayCard
            await pool.query(sqlUpState, [1, energyReset, opponent.pm_id]);
        } else if (opponent.pm_state_id == 3) { // if both have ended the turn 
                
                // increment turn count
                let sqlTurn = `update match set mt_turn = mt_turn + 1   
                               where mt_id = $1`;
                await pool.query(sqlTurn, [matchId]);
                energyReset = TurnToEnergy(match.mt_turn)

                // change state of player to Wait (opponent will go first this time)
                await pool.query(sqlUpState, [4, energyReset, pmId]);
                // change state of opponent to PlayCard
                await pool.query(sqlUpState, [1, energyReset, opponent.pm_id]);
            
        } else {
            return { status: 500, result: { msg: "Current state of the players in the match is not valid" } }
        }
     
        // get a set of new cards for the next player playing (the opponent)
        // get random card value
        this.createRandomCards(opponent.pm_id,5);
    }
        return { status: 200, result: { msg: "Turn ended" } };
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}

module.exports.done = async function (pmId) {
    try {
        let res;
        // get player match info 
        res = await this.getPlayerMatch(pmId);
        if (res.status != 200) return res;
        let player = res.result;
        if (player.pm_state_id != 1)
            return { status: 400, result: { msg: "You cannot go to attack phase at this moment" } };
        // Set player match states
        let sqlUpState = `update playermatch set pm_state_id = 2
                          where pm_id = $1`;
        // change state of player to Attack
        await pool.query(sqlUpState, [pmId]);
        return { status: 200, result: { msg: "Entered Attack Phase" } };
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}


function TurnToEnergy(turn){
    if(turn>8){
        return 5
    }else{
        return Math.trunc((turn+3)/2)
    }
}


//vvvvvvvvvvvvvvvv----------------------------------------------------------------------------------------vvvvvvvvvvvvvvvvvvvvvvvvvvv
module.exports.playCardFromHand = async function (pmId, deckId) {
    try {
        let res;
        // get player match info 
        res = await this.getPlayerMatch(pmId);
        if (res.status != 200) return res;
        let player = res.result;
        if (player.pm_state_id != 1)
            return { status: 400, result: { msg: "You cannot play a new card at this moment" } };
        
        //Get card info
        res = await this.getPlayerDeckCard(pmId,deckId)
        if (res.status != 200) return res;
        let card = res.result;
         //Check if enough energy
        if(player.pm_energy >= card.crd_cost){
        //if card is a buff
        if (card.crd_cardtype_id == 2){
            res = await this.getPlayerRandomDeckCard(pmId)
            if (res.status != 200) return res;
            
            let randomCard = res.result;
            await this.applyPlayerBuffCard(randomCard.deck_id, card.deck_card_id)
            // Discard card played
            let sqlDiscard = `delete from deck 
                            where deck_id = $1`;
            res = await pool.query(sqlDiscard, [card.deck_id]);
        }else if (card.crd_cardtype_id == 3){
            // get opponent info
            let matchId = player.pm_match_id;
            res = await this.getOpponent(pmId,matchId);
            if (res.status != 200) return res;
            let opponent = res.result;
            let opPmId = opponent.pm_id;
            console.log("-------------------------------------------opPmId = " + opPmId)
            // Remove 1hp from all enemy units on board
            let sql = `update deck 
                        SET deck_card_hp = deck_card_hp - 1 
                        WHERE deck_pm_id = $1
                        AND (deck_pos_id = 2 OR deck_pos_id = 3)`;
            res = await pool.query(sql, [opPmId]);
            // Discard card played
            let sqlDiscard = `delete from deck 
                        where deck_id = $1`;
            await pool.query(sqlDiscard, [card.deck_id]);
        }else if (card.crd_cardtype_id == 1){
            // Play card to the table
            let sql = `update deck set deck_pos_id = 3 
                   where deck_id = $1 and deck_pm_id = $2 
                   and deck_pos_id = 1 `;
            res = await pool.query(sql, [deckId, pmId]);
        }

        //Remove energy used
        if (res.rowCount > 0) {
            let sqlEnergy = `update playermatch set pm_energy = pm_energy - $1
                   where pm_id = $2`;
        await pool.query(sqlEnergy, [card.crd_cost, pmId]);
        console.log("player energy: "+player.pm_energy)

        //Change state if no more energy
        if(player.pm_energy - card.crd_cost < 1){
            let sqlState = `update playermatch set pm_state_id = 2 where pm_id = $1`;
            await pool.query(sqlState, [pmId]);
        }
            return { status: 200, result: { msg: "Card played" } };
        } else {
            return { status: 400, result: { msg: "That card is not on the players hand" } };
        }

    }else { // not enough energy
      return { status: 400, result: { msg: "Player does not have enough energy to play that card" } };
    }
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}



module.exports.attackCard = async function (pmId, deckId, opDeckId) {
    try {
        let res;
        // get player match info 
        res = await this.getPlayerMatch(pmId);
        if (res.status != 200) return res;
        let player = res.result;
        if (player.pm_state_id != 2)
            return { status: 400, result: { msg: "You cannot attack at this moment" } };
        // get player deck card info
        res = await this.getPlayerDeckCard(pmId,deckId)
        if (res.status != 200) return res;
        let card = res.result;
        if (card.deck_pos_id != 2)
            return { status: 400, result: { msg: "The card cannot attack at this moment" } };
        // get opponent info
        let matchId = player.pm_match_id;
        res = await this.getOpponent(pmId,matchId);
        if (res.status != 200) return res;
        let opponent = res.result;
        let opPmId = opponent.pm_id;
        
        res = await this.getPlayerDeckCard(opPmId, opDeckId,"opponent");
        if (res.status != 200) return res;
        let opCard = res.result;  
        if ((opCard.deck_pos_id != 2 && opCard.deck_pos_id != 3) || opCard.deck_hp <= 0)
            return { status: 400, result: { msg: "You can only attack cards on the table with HP higher or equal to zero." } };

        // Now everything is ok. Lets make the attack
        // Mark the cards that have "TablePlayed"
        let sqlUpPos = `update deck set deck_pos_id = 3
                        where deck_id = $1`
        await pool.query(sqlUpPos, [deckId]);

        
        let cardAtk = card.deck_card_atk;
        let opCardAtk = opCard.deck_card_atk;
        //Damage Enemy Card   
        let sqlAtk = `update deck set deck_card_hp = deck_card_hp - $1
                          where deck_id = $2`
            await pool.query(sqlAtk, [cardAtk,opDeckId]);
        //Damage Player Card
            let sqlRecoil = `update deck set deck_card_hp = deck_card_hp - $1
                          where deck_id = $2`
            await pool.query(sqlRecoil, [opCardAtk,deckId]);

            return { status: 200, result: { msg: "Attack made "+cardAtk+" damage (element advantage)" } };
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}



module.exports.getPlayerDeck = async function (pId, pmId) {
    try {
        let sqlCheck = `select * from playermatch where pm_player_id = $1 and pm_id = $2`;
        let resultCheck = await pool.query(sqlCheck, [pId, pmId]);
        if (resultCheck.rows.length > 0) { // I'm the owner of the deck
            let sql = `select deck_id, deck_pm_id, deck_pos_id, deck_card_id, deck_card_hp, deck_card_atk,
            cp_name, crd_name, crd_cost, crd_description, crd_cardtype_id
            from deck, cardpos, card
            where deck_pm_id = $1 and
                deck_pos_id = cp_id and
                deck_card_id = crd_id`;
            let result = await pool.query(sql, [pmId]);
            let cards = result.rows;
            return { status: 200, result: cards };
        }
        let sqlCheckOp = `
            select * from playermatch 
            where pm_player_id = $1 and pm_match_id IN
                (select pm_match_id from playermatch where pm_id = $2)`;
        let resultCheckOp = await pool.query(sqlCheckOp, [pId, pmId]);

        if (resultCheckOp.rows.length > 0) {
            let sql = `select deck_id, deck_pm_id, deck_pos_id, deck_card_id, deck_card_hp, deck_card_atk,
            cp_name, crd_name, crd_cost, crd_description, crd_cardtype_id
            from deck, cardpos, card 
            where deck_pm_id = $1 and
                deck_pos_id = cp_id and
                deck_card_id = crd_id and
                (cp_name LIKE 'Table' or  cp_name LIKE 'TablePlayed')  `;
            let result = await pool.query(sql, [pmId]);
            let cards = result.rows;
            return { status: 200, result: cards };
        }
        return { status: 401, result: { msg: "You are not playing in this match" } };

    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}




module.exports.getPlayerMatchInfo = async function (pmId) {
    try {
        let sql = `	select pm_id, pm_state_id, pm_hp, pm_energy, pms_name, mt_turn, mt_finished, ply_name, ply_id  
        from  playermatch, pmstate, match, player  
        where 
          pm_player_id = ply_id and
          pm_state_id = pms_id and
          pm_match_id = mt_id and
          pm_id = $1`;
        let result = await pool.query(sql, [pmId]);
        if (result.rows.length > 0) {
            let player = result.rows[0];
            return { status: 200, result: player };
        } else {
            return { status: 404, result: { msg: "No playermatch with that id" } };
        }
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}


module.exports.getPlayerInfo = async function (playerId) {
    try {
        let sql = `Select ply_name from player where ply_id = $1`;
        let result = await pool.query(sql, [playerId]);
        if (result.rows.length > 0) {
            let player = result.rows[0];
            return { status: 200, result: player };
        } else {
            return { status: 404, result: { msg: "No player with that id" } };
        }
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}

module.exports.login = async function (username,password) {
    try {
        let sql = `Select ply_name,ply_id from player 
        where ply_name = $1 and ply_passwd = $2`;
        let result = await pool.query(sql, [username,password]);
        if (result.rows.length > 0) {
            let player = result.rows[0];
            return { status: 200, result: player };
        } else {
            return { status: 401, result: { msg: "Wrong username/password" } };
        }
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}


module.exports.register = async function (username,password) {
    try {
        if (username.length < 4) {
            return {status: 400, 
                    result: {msg: "Username must have at least 4 characters"}}
        }else if (password.length < 8 || !containsNumber(password)) {
            return {status: 400, 
                    result: {msg: "Password must have at least 8 characters including a number"} };
        }else{
            let sql = `Select ply_name from player 
                        where ply_name = $1`;
            let result = await pool.query(sql, [username]);
            if (result.rows.length > 0){
                return { status: 400, result: {msg: "That player name is already in use."}}
            }else{
                sql = `Insert into player(ply_name,ply_passwd) values($1,$2)`;
                await pool.query(sql, [username,password]);
                return { status: 200, result: { msg: "Player created" } };
            }
        }
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}

function containsNumber(testString) {
    return /\d/.test(testString);
  }

module.exports.getPlayersAndMatchesWaiting =  async function (pId) {
    try {
        let sql = `select mt_id, pm_id, ply_name 
                    from playermatch,match, player
                   where pm_match_id = mt_id and mt_finished = false and
                   ply_id = pm_player_id and
                   (select count(*) from playermatch where pm_match_id = mt_id) = 1`
        let res = await pool.query(sql);
        return {status:200, result: res.rows};
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }

}

module.exports.getPlayerActiveMatches = async function (pId) {
    try {
        let sql = `Select * from playermatch, match 
                    where pm_match_id = mt_id 
                    and mt_finished = false
                    and pm_player_id = $1`;
        let result = await pool.query(sql, [pId]);
        return { status: 200, result: result.rows };
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}


module.exports.createRandomCards = async function (pmId,nCards) {
    try {
        for(let i=0; i < nCards; i++) {
            let sql = `select * from card 
                   order by random()
                   limit 1`;
            let res = await pool.query(sql);
            let cardId = res.rows[0].crd_id;
            let cardHp = res.rows[0].crd_health;
            let cardAtk = res.rows[0].crd_attack;
            sql = `insert into deck (deck_pm_id,deck_pos_id,deck_card_id,deck_card_hp, deck_card_atk) 
                    values ($1,1,$2,$3,$4) returning *`;         
            await pool.query(sql,[pmId,cardId,cardHp,cardAtk]);
        }
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}

module.exports.createMatch = async function (pId) {
    try {

        let res = await this.getPlayerActiveMatches(pId);
        if (res.result.length > 0){
            return {status:400, 
                result:{msg:"You can only have one active match."}}
            } else {
                let sql = `insert into match (mt_turn,mt_finished) 
                    values (1,false) returning *`;
        res = await pool.query(sql);
        let matchId = res.rows[0].mt_id;
        // player (match creator) starts first
        sql = `insert into playermatch (pm_player_id,pm_match_id,pm_state_id,pm_hp, pm_energy) 
               values ($1,$2,1,10,2) returning *`;         
        res = await pool.query(sql,[pId,matchId]);
       
        let pmId = res.rows[0].pm_id;
        // Create 5 random cards (with repetition)
        this.createRandomCards(pmId,5);
        return { status: 200, result: 
            {msg: "Match successfully created.", 
             matchId:matchId, pmId: pmId} };
            }
        } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}

module.exports.joinMatch = async function (pId,mId) {
    try {
        let res = await this.getPlayerActiveMatches(pId);
        if (res.result.length > 0)
            return {status:400, 
                result:{msg:"You can only have one active match."}}
        
        let sql = `select * from playermatch where pm_match_id = $1`;
        res = await pool.query(sql,[mId]);
        // since the match always has a player, no player means no match
        if (res.rows.length == 0) {
            return {status:400, 
                result:{msg:"There is no match with that id"}}
        } else if(res.rows.length > 1) {
            return {status:400, 
                result:{msg:"That match is full"}}
        }
        let oId = res.rows[0].pm_id;
        sql = `insert into playermatch (pm_player_id,pm_match_id,pm_state_id,pm_hp, pm_energy) 
               values ($1,$2,4,10,2) returning *`;         
        res = await pool.query(sql,[pId,mId]);
        let pmId = res.rows[0].pm_id;
        return { status: 200, result: {msg: "You successfully joined the match",
                                        pmId: pmId, oId: oId} };
    } catch (err) {
        console.log(err);
        return { status: 500, result: err };
    }
}
