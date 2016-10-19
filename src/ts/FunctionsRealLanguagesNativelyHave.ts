function shallowCopy(original) {
    var clone = Object.create(Object.getPrototypeOf(original));

    var i, keys = Object.getOwnPropertyNames(original);

    for (i = 0; i < keys.length; i++) {
        // copy each property into the clone
        Object.defineProperty(clone, keys[i],
            Object.getOwnPropertyDescriptor(original, keys[i])
        );
    }

    return clone;
}
function cast<T>(obj, cl): T {
    obj.__proto__ = cl.prototype;
    return obj;
}
