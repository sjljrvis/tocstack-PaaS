const fs = require('fs')
import { rootDirectory } from '../helper/constant'

module.exports.viewAllUsers = (req, res) => {
    req.query.search = req.query.search ? req.query.search : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
    req.query.sort = req.query.sort ? req.query.sort : '_id';
    req.query.page = req.query.page ? parseInt(req.query.page) : 1;
    var filters = {};
    var keys = "firstName email lastName permissions";
    req.app.db.models.User.pagedFind({
        filters: filters,
        keys: keys,
        limit: req.query.limit,
        page: req.query.page,
        sort: req.query.sort
    }, function (err, results) {
        if (err) {
            res.json({ message: "error" });
            return;
        }
        console.log(results);
        res.json(results);
    });
};
module.exports.viewUser = (req, res) => {
    req.app.db.models.User.findById(req.params.id, function (err, user) {
        if (err) {
            console.log("Error", err);
            res.json({ message: "error" });
            return
        }
        res.json(user);
    });
};

module.exports.deleteUser = (req, res) => {

req.app.db.models.User.findByIdAndRemove(req.params.id, function (err, user) {
    if (err) {
        console.log("Error", err);
        res.json({ message: "error" });
        return
    }
    res.json({ "message": "success" });

});
};


module.exports.addUser = (req, res) => {

    var user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        userName: req.body.userName,
        email: req.body.email,
    };
    if (!req.body.password || !req.body.email) {
        res.json({ "message": "error" });
        return
    }
    req.app.db.models.User.findOne({ email: req.body.email }, function (err, data) {
        if (err) {
            console.log("Error", err);
            res.json(err);
            return
        }
        if (data) {
            res.json({
                "status": "400",
                "message": "Duplicate Email Address"
            });
            return
        }
        req.app.db.models.User.create(user, (err, data) => {

            if (err) {
                console.log("Error", err);
                res.json(err);
                return
            }
            console.log("dir", rootDirectory + data.userName)
            fs.mkdirSync(rootDirectory + data.userName)
            res.json(data);
        })
    });
};

module.exports.editUser = (req, res) => {

    var user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        // email : req.body.email,
        username: req.body.username,
        permissions: req.body.permissions
    };
    if (req.body.password) {
        var SALT_FACTOR = 5;

        req.app.bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
            if (err) {
                res.json({ "message": "error" });
                return
            }
            req.app.bcrypt.hash(req.body.password, salt, function (err, hash) {
                if (err) {
                    res.json({ "message": "error" });
                    return
                }
                user.password = hash;
                req.app.db.models.User.findByIdAndUpdate(req.body.userId, user, (err, data) => {
                    if (err) {
                        console.log("Error", err);
                        res.json({ "message": "error" });
                    }
                    res.json({ "message": "success" });
                });
            });
        });
    }
    else {
        req.app.db.models.User.findByIdAndUpdate(req.body.userId, user, (err, data) => {

            if (err) {
                console.log("Error", err);
                res.json({
                    "message": "error"
                });
            }
            res.json({ "message": "success" });
        });
    }
};
