/*
 This file is part of web3.js.

 web3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 web3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @file utils.js
 * @author Marek Kotewicz <marek@ethcore.io>
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */


var _ = require('underscore');
var BigNumber = require('bn.js');
var ethjsUnit = require('ethjs-unit');
var numberToBN = require('number-to-bn');
var utf8 = require('utf8');
var keccak256 = require("js-sha3").keccak_256; // jshint ignore:line


/**
 * Sha3 encodes
 *
 * @method sha3
 * @return {Object} the sha3
 */
var sha3 = function (value) {

    return '0x'+ keccak256(value);
};

/**
 * Fires an error in an event emitter and callback and returns the eventemitter
 *
 * @method _fireError
 * @param {Object} error
 * @param {Object} emitter
 * @param {Function} reject
 * @param {Function} callback
 * @return {Object} the emitter
 */
var _fireError = function (error, emitter, reject, callback) {

    if (_.isFunction(callback)) {
        callback(error);
    }
    if (_.isFunction(reject)) {
        // suppress uncatched error if an error listener is present
        if(emitter &&
           _.isFunction(emitter.listeners) &&
           emitter.listeners('error').length &&
           _.isFunction(emitter.suppressUnhandledRejections)) {
            emitter.suppressUnhandledRejections();
        }
        reject(error);
    }

    if(emitter && _.isFunction(emitter.emit)) {
        emitter.emit('error', error);
        emitter.removeAllListeners();
    }

    return emitter;
};

/**
 * Should be called to pad string to expected length
 *
 * @method padLeft
 * @param {String} string to be padded
 * @param {Number} characters that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
var padLeft = function (string, chars, sign) {
    return new Array(chars - string.length + 1).join(sign ? sign : "0") + string;
};

/**
 * Should be called to pad string to expected length
 *
 * @method padRight
 * @param {String} string to be padded
 * @param {Number} characters that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
var padRight = function (string, chars, sign) {
    return string + (new Array(chars - string.length + 1).join(sign ? sign : "0"));
};

/**
 * Should be called to get utf8 from it's hex representation
 *
 * @method toUtf8
 * @param {String} string in hex
 * @returns {String} ascii string representation of hex value
 */
var toUtf8 = function(hex) {
// Find termination
    var str = "";
    var i = 0, l = hex.length;
    if (hex.substring(0, 2) === '0x') {
        i = 2;
    }
    for (; i < l; i+=2) {
        var code = parseInt(hex.substr(i, 2), 16);
        if (code === 0)
            break;
        str += String.fromCharCode(code);
    }

    return utf8.decode(str);
};

/**
 * Should be called to get ascii from it's hex representation
 *
 * @method toAscii
 * @param {String} string in hex
 * @returns {String} ascii string representation of hex value
 */
var toAscii = function(hex) {
// Find termination
    var str = "";
    var i = 0, l = hex.length;
    if (hex.substring(0, 2) === '0x') {
        i = 2;
    }
    for (; i < l; i+=2) {
        var code = parseInt(hex.substr(i, 2), 16);
        str += String.fromCharCode(code);
    }

    return str;
};

/**
 * Should be called to get hex representation (prefixed by 0x) of utf8 string
 *
 * @method fromUtf8
 * @param {String} string
 * @param {Number} optional padding
 * @returns {String} hex representation of input string
 */
var fromUtf8 = function(str) {
    str = utf8.encode(str);
    var hex = "";
    for(var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (code === 0)
            break;
        var n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
    }

    return "0x" + hex;
};

/**
 * Should be called to get hex representation (prefixed by 0x) of ascii string
 *
 * @method fromAscii
 * @param {String} string
 * @param {Number} optional padding
 * @returns {String} hex representation of input string
 */
var fromAscii = function(str) {
    var hex = "";
    for(var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        var n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
    }

    return "0x" + hex;
};

/**
 * Should be used to create full function/event name from json abi
 *
 * @method jsonInterfaceMethodToString
 * @param {Object} json-abi
 * @return {String} full fnction/event name
 */
var jsonInterfaceMethodToString = function (json) {
    if (json.name.indexOf('(') !== -1) {
        return json.name;
    }

    var typeName = json.inputs.map(function(i){return i.type; }).join();
    return json.name + '(' + typeName + ')';
};

/**
 * Should be called to get display name of contract function
 *
 * @method extractDisplayName
 * @param {String} name of function/event
 * @returns {String} display name for function/event eg. multiply(uint256) -> multiply
 */
// var extractDisplayName = function (name) {
//     var length = name.indexOf('(');
//     return length !== -1 ? name.substr(0, length) : name;
// };
//
// /// @returns overloaded part of function/event name
// var extractTypeName = function (name) {
//     /// TODO: make it invulnerable
//     var length = name.indexOf('(');
//     return length !== -1 ? name.substr(length + 1, name.length - 1 - (length + 1)).replace(' ', '') : "";
// };

/**
 * Converts value to it's decimal representation in string
 *
 * @method toDecimal
 * @param {String|Number|BigNumber}
 * @return {String}
 */
var toDecimal = function (value) {
    return toBigNumber(value).toNumber();
};

/**
 * Converts value to it's hex representation
 *
 * @method fromDecimal
 * @param {String|Number|BigNumber}
 * @return {String}
 */
var fromDecimal = function (value) {
    var number = toBigNumber(value);
    var result = number.toString(16);

    return number.lt(new BigNumber(0)) ? '-0x' + result.substr(1) : '0x' + result;
};

/**
 * Auto converts any given value into it's hex representation.
 *
 * And even stringifys objects before.
 *
 * @method toHex
 * @param {String|Number|BigNumber|Object}
 * @return {String}
 */
var toHex = function (val) {
    /*jshint maxcomplexity: 8 */

    if (_.isBoolean(val))
        return fromDecimal(+val);

    if (isBN(val))
        return fromDecimal(val);

    if (_.isObject(val))
        return fromUtf8(JSON.stringify(val));

    // if its a negative number, pass it through fromDecimal
    if (_.isString(val)) {
        if (val.indexOf('-0x') === 0)
            return fromDecimal(val);
        else if(val.indexOf('0x') === 0)
            return val;
        else if (!isFinite(val))
            return fromAscii(val);
    }

    return fromDecimal(val);
};

/**
 * Returns value of unit in Wei
 *
 * @method getUnitValue
 * @param {String} unit the unit to convert to, default ether
 * @returns {BigNumber} value of the unit (in Wei)
 * @throws error if the unit is not correct:w
 */
var getUnitValue = function (unit) {
    unit = unit ? unit.toLowerCase() : 'ether';
    if (!ethjsUnit.unitMap[unit]) {
        throw new Error('This unit "'+ unit +'" doesn\'t exist, please use the one of the following units' + JSON.stringify(ethjsUnit.unitMap, null, 2));
    }
    return unit;
};

/**
 * Takes a number of wei and converts it to any other ether unit.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @method fromWei
 * @param {Number|String} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert to, default ether
 * @return {String|Object} When given a BigNumber object it returns one as well, otherwise a number
 */
var fromWei = function(number, unit) {
    unit = getUnitValue(unit);

    return isBN(number) ? ethjsUnit.fromWei(number, unit) : ethjsUnit.fromWei(number, unit).toString(10);
};

/**
 * Takes a number of a unit and converts it to wei.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @method toWei
 * @param {Number|String|BigNumber} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert from, default ether
 * @return {String|Object} When given a BigNumber object it returns one as well, otherwise a number
 */
var toWei = function(number, unit) {
    unit = getUnitValue(unit);

    return isBN(number) ? ethjsUnit.toWei(number, unit) : ethjsUnit.toWei(number, unit).toString(10);
};

/**
 * Takes an input and transforms it into an bignumber
 *
 * @method toBigNumber
 * @param {Number|String|BigNumber} a number, string, HEX string or BigNumber
 * @return {BigNumber} BigNumber
 */
var toBigNumber = function(number) {
    /*jshint maxcomplexity:5 */
    number = number || 0;
    if (isBN(number))
        return number;

    if (_.isString(number) && (number.indexOf('0x') === 0 || number.indexOf('-0x') === 0)) {
        return numberToBN(number);
    }

    return new BigNumber(number.toString(10), 10);
};

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
 */
var isAddress = function (address) {
    if (!/^(0x|0X)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x|0X)?[0-9a-f]{40}$/.test(address) || /^(0x|0X)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return true
        return true;
    } else {
        // Otherwise check each case
        return isChecksumAddress(address);
    }
};



/**
 * Checks if the given string is a checksummed address
 *
 * @method isChecksumAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
 */
var isChecksumAddress = function (address) {
    // Check each case
    address = address.replace('0x','');
    var addressHash = sha3(address.toLowerCase()).replace('0x','');

    for (var i = 0; i < 40; i++ ) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
};



/**
 * Makes a checksum address
 *
 * @method toChecksumAddress
 * @param {String} address the given HEX adress
 * @return {String}
 */
var toChecksumAddress = function (address) {
    if (typeof address === 'undefined') return '';

    address = address.toLowerCase().replace('0x','');
    var addressHash = sha3(address).replace('0x','');
    var checksumAddress = '0x';

    for (var i = 0; i < address.length; i++ ) {
        // If ith character is 9 to f then make it uppercase
        if (parseInt(addressHash[i], 16) > 7) {
            checksumAddress += address[i].toUpperCase();
        } else {
            checksumAddress += address[i];
        }
    }
    return checksumAddress;
};

/**
 * Transforms given string to valid 20 bytes-length addres with 0x prefix
 *
 * @method toAddress
 * @param {String} address
 * @return {String} formatted address
 */
var toAddress = function (address) {
    if (isAddress(address)) {
        return '0x'+ address.toLowerCase().replace('0x','');
    }

    if (/^[0-9a-f]{40}$/.test(address)) {
        return '0x' + address;
    }

    return '0x' + padLeft(toHex(address).substr(2), 40);
};

/**
 * Returns true if object is BigNumber, otherwise false
 *
 * @method isBN
 * @param {Object} object
 * @return {Boolean}
 */
var isBN = function (object) {
    return object instanceof BigNumber ||
        (object && object.constructor && object.constructor.name === 'BN');
};


module.exports = {
    _fireError: _fireError,
    padLeft: padLeft,
    padRight: padRight,
    toHex: toHex,
    toDecimal: toDecimal,
    fromDecimal: fromDecimal,
    toUtf8: toUtf8,
    toAscii: toAscii,
    fromUtf8: fromUtf8,
    fromAscii: fromAscii,
    jsonInterfaceMethodToString: jsonInterfaceMethodToString,
    // extractDisplayName: extractDisplayName,
    // extractTypeName: extractTypeName,
    toWei: toWei,
    fromWei: fromWei,
    toBigNumber: toBigNumber,
    toAddress: toAddress,
    isBN: isBN,
    isBigNumber: isBN,
    isAddress: isAddress,
    isChecksumAddress: isChecksumAddress,
    toChecksumAddress: toChecksumAddress,
    sha3: sha3
};
