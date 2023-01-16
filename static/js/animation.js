const animation = document.querySelector('#load');

animation.addEventListener('animationend', () => {
  window.location.href = './login';
});
