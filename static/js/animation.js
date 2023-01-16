const animation = document.querySelector('#load');

console.log(animation);

animation.addEventListener('animationend', () => {
  window.location.href = './login';
});
