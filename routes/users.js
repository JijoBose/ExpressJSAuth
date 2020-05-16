var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/api/account/signup', (req, res, next) => {
  const { body } = req;
  const { password } = body;
  let { email } = body;

  if (!email) {
    return res.send({
      success: false,
      message: 'Error: Email cannot be blank.'
    });
  }

  if (!password) {
    return res.send({
      success: false,
      message: 'Error: Password cannot be blank.'
    });
  }
  email = email.toLowerCase();
  email = email.trim();

  //Verify email doesn't exist
  User.find({ email: email }, (err, previousUsers) => {
    if (err) {
      return res.send({
        success: false,
        message: 'Error: Server error'
      });
    } else if (previousUsers.length > 0) {
      return res.send({
        success: false,
        message: 'Error: Account already exist.'
      });
    }
    // Save the new user
    const newUser = new User();
    newUser.email = email;
    newUser.password = newUser.generateHash(password);
    newUser.save((err, user) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }
      return res.send({
        success: true,
        message: 'Signed up'
      });
    });
  });
})

router.post('/api/account/signin', (req, res, next) => {
  const { body } = req;
  const { password } = body;
  let { email } = body;
  if (!email) {
    return res.send({
      success: false,
      message: 'Error: Email cannot be blank.'
    });
  }
  if (!password) {
    return res.send({
      success: false,
      message: 'Error: Password cannot be blank.'
    });
  }
  email = email.toLowerCase();

  User.find({ email: email }, (err, users) => {
    if (err) {
      return res.send({
        success: false,
        message: 'Error: Server error'
      });
    } if (users.length != 1) {
      return res.send({
        success: false,
        message: 'Error: Invalid.'
      });
    }
    const user = users[0];
    if (!user.validPassword(password)) {
      return res.send({
        success: false,
        message: 'Error: Account already exist.'
      });
    }
    //save userSession

    const userSession = new UserSession();
    userSession.userId = user._id;
    userSession.save((err, doc) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }
      return res.send({
        success: true,
        message: 'Valid Signin.',
        token: doc._id
      });
    });
  });
});

router.get('/api/account/verify', (req, res, next) => {
  const { query } = req;
  const { token } = query;
  UserSession.find({
    _id: token,
    isDeleted: false
  }, (err, sessions) => {
    if (err) {
      return res.send({
        success: false,
        message: 'Err: Server Error'
      })
    }
    if (sessions.length != 1) {
      return res.send({
        success: false,
        message: 'Err: Server Error'
      })
    }
    else {
      return res.send({
        success: true,
        message: 'No Error'
      })
    }
  });
}); //end of Verify

router.get('/api/account/logout', (req, res, next) => {
  const { query } = req;
  const { token } = query;
  UserSession.findOneAndUpdate({
    _id: token,
    isDeleted: false
  }, {
    $set: { isDeleted: true }
  }, null, (err, sessions) => {
    if (err) {
      console.log(err);
      return res.send({
        success: false,
        message: 'Err: Server Error'
      });
    }

    return res.send({
      success: true,
      message: 'No Error'
    });
  });
});

module.exports = router;
