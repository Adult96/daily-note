function selectorShowOrHide(boolean, ...selectors) {
  if (boolean === true) {
    selectors.map(selector => (selector.style.display = 'block'));
  } else {
    selectors.map(selector => (selector.style.display = 'none'));
  }
}

//========================= 달력 시작=========================
const mainPage = document.querySelector('.container.note');

//달력 클릭 이벤트
document.addEventListener('click', e => {
  if (e.target.className === 'day current') {
    selectorShowOrHide(false, mainPage);
    show_daily('ndk','20230116')
  }
});

$(document).ready(function () {
  calendarInit();
});
/*
  달력 렌더링 할 때 필요한 정보 목록 

  현재 월(초기값 : 현재 시간)
  금월 마지막일 날짜와 요일
  전월 마지막일 날짜와 요일
*/

function calendarInit() {
  // 날짜 정보 가져오기
  var date = new Date(); // 현재 날짜(로컬 기준) 가져오기
  var utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000; // uct 표준시 도출
  var kstGap = 9 * 60 * 60 * 1000; // 한국 kst 기준시간 더하기
  var today = new Date(utc + kstGap); // 한국 시간으로 date 객체 만들기(오늘)

  var thisMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  // 달력에서 표기하는 날짜 객체

  var currentYear = thisMonth.getFullYear(); // 달력에서 표기하는 연
  var currentMonth = thisMonth.getMonth(); // 달력에서 표기하는 월
  var currentDate = thisMonth.getDate(); // 달력에서 표기하는 일

  // kst 기준 현재시간
  // console.log(thisMonth);

  // 캘린더 렌더링
  renderCalender(thisMonth);

  function renderCalender(thisMonth) {
    // 렌더링을 위한 데이터 정리
    currentYear = thisMonth.getFullYear();
    currentMonth = thisMonth.getMonth();
    currentDate = thisMonth.getDate();

    // 이전 달의 마지막 날 날짜와 요일 구하기
    var startDay = new Date(currentYear, currentMonth, 0);
    var prevDate = startDay.getDate();
    var prevDay = startDay.getDay();

    // 이번 달의 마지막날 날짜와 요일 구하기
    var endDay = new Date(currentYear, currentMonth + 1, 0);
    var nextDate = endDay.getDate();
    var nextDay = endDay.getDay();

    // console.log(prevDate, prevDay, nextDate, nextDay);

    // 현재 월 표기
    $('.year-month').text(currentYear + '.' + (currentMonth + 1));

    // 렌더링 html 요소 생성
    calendar = document.querySelector('.dates');
    calendar.innerHTML = '';

    // 지난달
    for (var i = prevDate - prevDay + 1; i <= prevDate; i++) {
      calendar.innerHTML =
        calendar.innerHTML + '<div class="day prev disable">' + i + '</div>';
    }
    // 이번달
    for (var i = 1; i <= nextDate; i++) {
      calendar.innerHTML =
        calendar.innerHTML + '<div class="day current">' + i + '</div>';
    }
    // 다음달
    for (var i = 1; i <= (7 - nextDay == 7 ? 0 : 7 - nextDay); i++) {
      calendar.innerHTML =
        calendar.innerHTML + '<div class="day next disable">' + i + '</div>';
    }

    // 오늘 날짜 표기
    if (today.getMonth() == currentMonth) {
      todayDate = today.getDate();
      var currentMonthDate = document.querySelectorAll('.dates .current');
      currentMonthDate[todayDate - 1].classList.add('today');
    }
  }

  // 이전달로 이동
  $('.go-prev').on('click', function () {
    thisMonth = new Date(currentYear, currentMonth - 1, 1);
    renderCalender(thisMonth);
  });

  // 다음달로 이동
  $('.go-next').on('click', function () {
    thisMonth = new Date(currentYear, currentMonth + 1, 1);
    renderCalender(thisMonth);
  });
}


//========================= 달력 끝=========================

// 날짜 별 데이터 보여주기
function show_daily(id, date) {
  $('#cards-box').empty()
  $.ajax({
    type: 'POST',
    url: '/show_daily',
    data: {'give_id':id , 'give_date':date},
    success: function (response) {
      let rows = response['daily_list']
      console.log(rows);
      for (let i = 0; i < rows.length; i++) {
        let index = rows[i]['index']
        // let id = rows[i]['id']
        // let date = rows[i]['date']
        let title = rows[i]['title']
        let content = rows[i]['content']


        let temp_html = `<div class="col">
                                            <div class="card h-100">
                                                <img src=""
                                                     class="card-img-top">
                                                <div class="card-body">
                                                    <h5 class="card-title">${title}</h5>
                                                    <p class="card-text">${content}</p>
                                                    <button>삭제</button>
                                                </div>
                                            </div>
                                        </div>`
        $('#cards-box').append(temp_html)
      }
    }
  })
}
