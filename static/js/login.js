const loginBtn = document.querySelector('#login-btn');
const signUpBtn = document.querySelector('#sign-up-btn');
const signUpCheckBtn = document.querySelector('#sign-up-check');
const signUpBackBtn = document.querySelector('#sign-up-back');

const idInput = document.querySelector('#floatingId');
const passwordInput = document.querySelector('#floatingPassword');
const passwordCheckInput = document.querySelector('#floatingPasswordCheck');

loginBtn.addEventListener('click', e => {
  e.preventDefault();
  const userId = idInput.value;
  const userPassword = passwordInput.value;

  if (!loginCrossCheck(userId, userPassword)) {
    return;
  }

  // const userID = sendUserData(userId, userPassword);
  if (!sendUserData(userId, userPassword)) {
    return;
  }

  make_Token(userId, userPassword);
});

signUpBtn.addEventListener('click', e => {
  e.preventDefault();
  selectorShowOrHide(false, loginBtn, signUpBtn);
  selectorShowOrHide(true, passwordCheckInput, signUpCheckBtn, signUpBackBtn);
});

signUpCheckBtn.addEventListener('click', e => {
  e.preventDefault();
  const userId = idInput.value;
  const password = passwordInput.value;
  const passwordCheck = passwordCheckInput.value;

  if (!singupCrossCheck(userId, password, passwordCheck)) {
    return;
  }

  if (!sendUserData(userId, password, passwordCheck)) {
    return;
  }

  selectorShowOrHide(true, loginBtn, signUpBtn);
  selectorShowOrHide(false, passwordCheckInput, signUpCheckBtn, signUpBackBtn);
});

signUpBackBtn.addEventListener('click', () => {
  window.location.reload();
});

function make_Token(id, password) {
  $.ajax({
    type: 'POST',
    url: '/token',
    data: {
      id_give: id,
      password_give: password,
    },
    success: function (response) {
      // jwt토큰을 가지는 쿠키 생성
      console.log(response['token']);
      if (response['result'] == 'success') {
        $.cookie('mytoken', response['token']);
        // alert('쿠키생성 성공!');
        window.location.href = './main';
      }
    },
    error: function (response) {
      alert(response['msg']);
    },
  });
}

function singupCrossCheck(userId, password, otherPassword) {
  if (userId === '' || password === '' || otherPassword === '') {
    toastr.error('공백란을 채워 주세요');

    return false;
  }
  if (password !== otherPassword) {
    toastr.error('동일한 비밀번호를 입력해 주세요');

    return false;
  }

  return true;
}

function loginCrossCheck(userId, password) {
  if (userId === '' || password === '') {
    toastr.error('공백란을 채워 주세요');
    return false;
  }

  return true;
}

function selectorShowOrHide(boolean, ...selectors) {
  if (boolean === true) {
    selectors.map(selector => (selector.style.display = 'block'));
  } else {
    selectors.map(selector => (selector.style.display = 'none'));
  }
}

function sendUserData(id, password, passwordCheck = null) {
  let checkData = true;

  $.ajax({
    type: 'POST',
    url: '/login',
    data: {
      id_give: id,
      pw_give: password,
      pw_check_give: passwordCheck,
    },
    async: false,
    success: function (response) {
      if (response['complete']) {
        response['complete'];
      } else if (response['create']) {
        toastr.success(response['create']);
      } else if (response['fail']) {
        toastr.error(response['fail']);
        checkData = false;
      } else {
        toastr.error(response['error']);
        checkData = false;
      }
    },
    error: function () {
      alert('로그인 정보가 없습니다.');
      checkData = false;
    },
  });
  return checkData;
}
