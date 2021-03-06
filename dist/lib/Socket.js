'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PULL_TIME = exports.EVENT_TTL = exports.create = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var create = exports.create = function () {
    var _ref7 = (0, _asyncToGenerator3['default'])(_regenerator2['default'].mark(function _callee7(database) {
        var socket;
        return _regenerator2['default'].wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        socket = new Socket(database);
                        _context7.next = 3;
                        return socket.prepare();

                    case 3:
                        return _context7.abrupt('return', socket);

                    case 4:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function create(_x3) {
        return _ref7.apply(this, arguments);
    };
}();

var _RxCollection = require('./RxCollection');

var RxCollection = _interopRequireWildcard(_RxCollection);

var _RxChangeEvent = require('./RxChangeEvent');

var RxChangeEvent = _interopRequireWildcard(_RxChangeEvent);

var _RxBroadcastChannel = require('./RxBroadcastChannel');

var RxBroadcastChannel = _interopRequireWildcard(_RxBroadcastChannel);

var _util = require('./util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var EVENT_TTL = 5000; // after this age, events will be deleted
var PULL_TIME = RxBroadcastChannel.canIUse() ? EVENT_TTL / 2 : 200;

var Socket = function () {
    function Socket(database) {
        (0, _classCallCheck3['default'])(this, Socket);

        this._destroyed = false;
        this.database = database;
        this.token = database.token;
        this.subs = [];

        this.pullCount = 0;
        this.pull_running = false;
        this.lastPull = new Date().getTime();
        this.recievedEvents = {};

        this.bc = RxBroadcastChannel.create(this.database, 'socket');
        this.messages$ = new util.Rx.Subject();
    }

    (0, _createClass3['default'])(Socket, [{
        key: 'prepare',
        value: function () {
            var _ref = (0, _asyncToGenerator3['default'])(_regenerator2['default'].mark(function _callee2() {
                var _this = this;

                return _regenerator2['default'].wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                // create socket-collection
                                this.pouch = this.database._spawnPouchDB('_socket', 0, {
                                    auto_compaction: false, // this is false because its done manually at .pull()
                                    revs_limit: 1
                                });

                                // pull on BroadcastChannel-message
                                if (this.bc) {
                                    this.subs.push(this.bc.$.filter(function (msg) {
                                        return msg.type == 'pull';
                                    }).subscribe(function (msg) {
                                        return _this.pull();
                                    }));
                                }

                                // pull on intervall
                                (0, _asyncToGenerator3['default'])(_regenerator2['default'].mark(function _callee() {
                                    return _regenerator2['default'].wrap(function _callee$(_context) {
                                        while (1) {
                                            switch (_context.prev = _context.next) {
                                                case 0:
                                                    if (_this._destroyed) {
                                                        _context.next = 8;
                                                        break;
                                                    }

                                                    _context.next = 3;
                                                    return util.promiseWait(PULL_TIME);

                                                case 3:
                                                    if (!(_this.messages$.observers.length > 0)) {
                                                        _context.next = 6;
                                                        break;
                                                    }

                                                    _context.next = 6;
                                                    return _this.pull();

                                                case 6:
                                                    _context.next = 0;
                                                    break;

                                                case 8:
                                                case 'end':
                                                    return _context.stop();
                                            }
                                        }
                                    }, _callee, _this);
                                }))();

                                return _context2.abrupt('return');

                            case 4:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function prepare() {
                return _ref.apply(this, arguments);
            }

            return prepare;
        }()

        /**
         * write the given event to the socket
         */

    }, {
        key: 'write',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3['default'])(_regenerator2['default'].mark(function _callee3(changeEvent) {
                var socketDoc;
                return _regenerator2['default'].wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return util.requestIdlePromise();

                            case 2:
                                socketDoc = changeEvent.toJSON();

                                delete socketDoc.db;

                                // TODO find a way to getAll on local documents
                                //  socketDoc._id = '_local/' + util.fastUnsecureHash(socketDoc);
                                socketDoc._id = '' + util.fastUnsecureHash(socketDoc) + socketDoc.t;
                                _context3.next = 7;
                                return this.pouch.put(socketDoc);

                            case 7:
                                _context3.t0 = this.bc;

                                if (!_context3.t0) {
                                    _context3.next = 11;
                                    break;
                                }

                                _context3.next = 11;
                                return this.bc.write('pull');

                            case 11:
                                return _context3.abrupt('return', true);

                            case 12:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function write(_x) {
                return _ref3.apply(this, arguments);
            }

            return write;
        }()

        /**
         * get all docs from the socket-collection
         */

    }, {
        key: 'fetchDocs',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3['default'])(_regenerator2['default'].mark(function _callee4() {
                var result;
                return _regenerator2['default'].wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.pouch.allDocs({
                                    include_docs: true
                                });

                            case 2:
                                result = _context4.sent;
                                return _context4.abrupt('return', result.rows.map(function (row) {
                                    return row.doc;
                                }));

                            case 4:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function fetchDocs() {
                return _ref4.apply(this, arguments);
            }

            return fetchDocs;
        }()
    }, {
        key: 'deleteDoc',
        value: function () {
            var _ref5 = (0, _asyncToGenerator3['default'])(_regenerator2['default'].mark(function _callee5(doc) {
                return _regenerator2['default'].wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.prev = 0;
                                _context5.next = 3;
                                return this.pouch.remove(doc);

                            case 3:
                                _context5.next = 7;
                                break;

                            case 5:
                                _context5.prev = 5;
                                _context5.t0 = _context5['catch'](0);

                            case 7:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this, [[0, 5]]);
            }));

            function deleteDoc(_x2) {
                return _ref5.apply(this, arguments);
            }

            return deleteDoc;
        }()

        /**
         * grab all new events from the socket-pouchdb
         * and throw them into this.messages$
         */

    }, {
        key: 'pull',
        value: function () {
            var _ref6 = (0, _asyncToGenerator3['default'])(_regenerator2['default'].mark(function _callee6() {
                var _this2 = this;

                var minTime, docs, maxAge, delDocs;
                return _regenerator2['default'].wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                if (!this.isPulling) {
                                    _context6.next = 3;
                                    break;
                                }

                                this._repullAfter = true;
                                return _context6.abrupt('return', false);

                            case 3:
                                this.isPulling = true;
                                this.pullCount++;

                                // w8 for idle-time because this is a non-prio-task
                                _context6.next = 7;
                                return util.requestIdlePromise(EVENT_TTL / 2);

                            case 7:
                                if (!this._destroyed) {
                                    _context6.next = 9;
                                    break;
                                }

                                return _context6.abrupt('return');

                            case 9:
                                minTime = this.lastPull - 100; // TODO evaluate this value (100)

                                _context6.next = 12;
                                return this.fetchDocs();

                            case 12:
                                docs = _context6.sent;

                                if (!this._destroyed) {
                                    _context6.next = 15;
                                    break;
                                }

                                return _context6.abrupt('return');

                            case 15:
                                docs.filter(function (doc) {
                                    return doc.it != _this2.token;
                                } // do not get events emitted by self
                                // do not get events older than minTime
                                ).filter(function (doc) {
                                    return doc.t > minTime;
                                }
                                // sort timestamp
                                ).sort(function (a, b) {
                                    if (a.t > b.t) return 1;
                                    return -1;
                                }).map(function (doc) {
                                    return RxChangeEvent.fromJSON(doc);
                                }
                                // make sure the same event is not emitted twice
                                ).filter(function (cE) {
                                    if (_this2.recievedEvents[cE.hash]) return false;
                                    return _this2.recievedEvents[cE.hash] = new Date().getTime();
                                }
                                // prevent memory leak of this.recievedEvents
                                ).filter(function (cE) {
                                    return setTimeout(function () {
                                        return delete _this2.recievedEvents[cE.hash];
                                    }, EVENT_TTL * 3);
                                }
                                // emit to messages
                                ).forEach(function (cE) {
                                    return _this2.messages$.next(cE);
                                });

                                if (!this._destroyed) {
                                    _context6.next = 18;
                                    break;
                                }

                                return _context6.abrupt('return');

                            case 18:

                                // delete old documents
                                maxAge = new Date().getTime() - EVENT_TTL;
                                delDocs = docs.filter(function (doc) {
                                    return doc.t < maxAge;
                                }).map(function (doc) {
                                    return _this2.deleteDoc(doc);
                                });

                                if (!(delDocs.length > 0)) {
                                    _context6.next = 23;
                                    break;
                                }

                                _context6.next = 23;
                                return this.pouch.compact();

                            case 23:

                                this.lastPull = new Date().getTime();
                                this.isPulling = false;
                                if (this._repull) {
                                    this._repull = false;
                                    this.pull();
                                }
                                return _context6.abrupt('return', true);

                            case 27:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function pull() {
                return _ref6.apply(this, arguments);
            }

            return pull;
        }()
    }, {
        key: 'destroy',
        value: function destroy() {
            this._destroyed = true;
            this.subs.map(function (sub) {
                return sub.unsubscribe();
            });
            if (this.bc) this.bc.destroy();
        }
    }, {
        key: '$',
        get: function get() {
            return this.messages$.asObservable();
        }
    }]);
    return Socket;
}();

exports.EVENT_TTL = EVENT_TTL;
exports.PULL_TIME = PULL_TIME;
