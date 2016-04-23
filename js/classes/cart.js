//----------------------------------------------------------------
// shopping cart
//
function cart(cartName) {
    this.cartName = cartName;
    this.clearCart = false;
    this.items = [];

    // load items from local storage when initializing
    this.loadItems();

    // save items to local storage when unloading
    var self = this;
    $(window).unload(function () {
        if (self.clearCart) {
            self.clearItems();
        }
        self.saveItems();
        self.clearCart = false;
    });
}

cart.prototype.loadItems = function () {
    var items = localStorage != null ? localStorage[this.cartName + "_items"] : null;
    if (items != null && JSON != null) {
        try {
            var items = JSON.parse(items);
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.id != null && item.name != null && item.color != null && item.size != null&& item.price != null && item.quantity != null  && item.images != null) {
                    item = new cartItem(item.id, item.name,item.color,item.size, item.price, item.quantity,item.images);
                    this.items.push(item);
                }
            }
        }
        catch (err) {
            // ignore errors while loading...
        }
    }
}




cart.prototype.saveItems = function () {
    if (localStorage != null && JSON != null) {
        localStorage[this.cartName + "_items"] = JSON.stringify(this.items);
    }
}




// adds an item to the cart
cart.prototype.addItem = function (id, name, color,size, price, quantity, images) {
    console.log("Added Items!"+ name);
    quantity = this.toNumber(quantity);
    if (quantity != 0) {

        // update quantity for existing item
        var found = false;
        for (var i = 0; i < this.items.length && !found; i++) {
            var item = this.items[i];
            if (item.id == id) {
                found = true;
                item.quantity = this.toNumber(item.quantity + quantity);
                if (item.quantity <= 0) {
                    this.items.splice(i, 1);
                }
            }
        }

        // new item, add now
        if (!found) {
            var item = new cartItem(id, name, color, size, price, quantity, images);
            this.items.push(item);
        }

        // save changes
        //this.saveItems();
    }
}

// get the total price for all items currently in the cart
cart.prototype.getTotalPrice = function (id) {
    var total = 0;
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (id == null || item.id == id) {
            total += this.toNumber(item.quantity * item.price);
        }
    }
    return total;
}

// get the total count for all items currently in the cart
cart.prototype.getTotalCount = function (id) {
    var count = 0;
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (id == null || item.id == id) {
            count += this.toNumber(item.quantity);
        }
    }
    return count;
}

// clear the cart
cart.prototype.clearItems = function () {
    this.items = [];
    this.saveItems();
}


cart.prototype.toNumber = function (value) {
    value = value * 1;
    return isNaN(value) ? 0 : value;
}


//----------------------------------------------------------------
// items in the cart
//
function cartItem(id, name, color, size, price, quantity, images) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.size = size;
    this.price = price;
    this.quantity = quantity;
    this.images = images;
}