const CWIDTH = 80;
const CHEIGHT = 120;
const IMGSIZEX = 75;
const IMGSIZEY = 115;


class Card {
    static images = {};
    constructor(id,card_id,name, cost, hp, attack, attacked, x, y, type) {
        this.id=id;
        this.card_id = card_id;
        this.name = name;
        this.cost = cost;
        this.hp = hp;
        this.attack = attack;
        this.x = x;
        this.y = y;
        this.enabled = true;
        this.attacked = attacked;
        this.selected = false;
        this.type = type
    }
    draw() {
        if (this.selected) {
            fill(100, 200, 100);
        } else if (this.attacked) {
            fill(200, 100, 100)
        } else {
            fill(100, 100, 100);
        }
        strokeWeight(3);
        if (this.enabled) {
            stroke(200, 0, 0);
        } else {
            stroke(0, 0, 0);
        }
        rect(this.x, this.y, CWIDTH, CHEIGHT, 2, 2, 2, 2);
        fill(0, 0, 0);
        stroke(0, 0, 0);
        strokeWeight(1);
       // textAlign(CENTER, CENTER);
        //text(this.name, this.x + CWIDTH / 2, this.y + CHEIGHT *2/ 3);
       // if (this.name != "Sticker" && this.name != "Clipper" && this.name != "Charger"){
        if (this.type == 1){
            textAlign(LEFT, CENTER);
            text("HP: " + this.hp, this.x +45, this.y + CHEIGHT +15);
            text("ATK: " + this.attack, this.x+5, this.y + CHEIGHT +15);
        }
        imageMode(CENTER)
        image(Card.images[this.card_id],this.x+CWIDTH/2, this.y+ CHEIGHT/2,IMGSIZEX,IMGSIZEY);
    }
    getId() { return this.id;}
    getCost() { return this.cost;}
    getName() { return this.name;}
    getType() {return this.type;}
    
    hasAttacked() { return this.attacked; }
    setAttack(hasAttacked) { this.attacked = hasAttacked }
    
    getHp() { return this.hp; }
    setHp(hp) { this.hp = hp }

    getAttack() { return this.attack; }
    setAttackValue(atk) { this.attack = atk }

    enable() { this.enabled = true }
    disable() { this.enabled = false }
    
    isSelected() { return this.selected; }
    deselect() {this.selected = false;}

    clicked(x, y) {
        if (this.enabled) {
            if (this.x <= x && (this.x + CWIDTH) >= x &&
                this.y <= y && (this.y + CHEIGHT) >= y) {
                this.selected = !this.selected;
                return true;
            }
        }
        return false;
    }

}