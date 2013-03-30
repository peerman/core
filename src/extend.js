function extend(dest, src) {

    for(var key in src.prototype) {
        dest.prototype[key] = src.prototype[key];
    }
}