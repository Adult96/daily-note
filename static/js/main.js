// global variable
let yearAndMonth = null;
let day = null;
let data = {};
let dataIndex = null;

function selectorShowOrHide(boolean, ...selectors) {
    if (boolean === true) {
        selectors.map((selector) => (selector.style.display = 'block'));
    } else {
        selectors.map((selector) => (selector.style.display = 'none'));
    }
}

//========================= 달력 =========================
const mainPage = document.querySelector('.container.note');
const mainPageList = document.querySelector('.container.note-list');
const yearMonth = document.querySelector('.year-month');
//달력 클릭 이벤트

document.addEventListener('click', (e) => {
    const target = e.target.className;

    //날짜 전역변수 저장
    const dateSplit = yearMonth.innerHTML.split('.');
    const addZeroMonth = dateSplit[1].length === 1 ? `0${dateSplit[1]}` : `${dateSplit[1]}`;

    if (target === 'day current' || target === 'day current today') {
        yearAndMonth = `${dateSplit[0]}.${addZeroMonth}`;
        day = `${e.target.innerText}`;

        selectorShowOrHide(false, mainPage);
        selectorShowOrHide(true, mainPageList);

        const dailyData = showAjax();
        //전역 변수 저장
        data = dailyData;

        show_daily(dailyData);
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

    var thisMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate());
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

        // console.log(prevDate, prevDay, nextDate, nextDay)

        // 현재 월 표기
        $('.year-month').text(currentYear + '.' + (currentMonth + 1));

        // 렌더링 html 요소 생성
        calendar = document.querySelector('.dates');
        calendar.innerHTML = '';

        // 지난달
        for (var i = prevDate - prevDay + 1; i <= prevDate; i++) {
            calendar.innerHTML = calendar.innerHTML + '<div class="day prev disable">' + i + '</div>';
        }
        // 이번달
        for (var i = 1; i <= nextDate; i++) {
            calendar.innerHTML = calendar.innerHTML + '<div class="day current">' + i + '</div>';
        }
        // 다음달
        for (var i = 1; i <= (7 - nextDay == 7 ? 0 : 7 - nextDay); i++) {
            calendar.innerHTML = calendar.innerHTML + '<div class="day next disable">' + i + '</div>';
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

//========================= 리스트 상세페이지 =========================

const noteAdd = document.querySelector('#note-add');
const notePop = document.querySelector('#notePop');
const noteEdit = document.querySelector('note-edit');

const noteAddPop = document.querySelector('#note-add-pop');
const noteEditPop = document.querySelector('#calendar-edit-pop');

const cardBox = document.querySelector('#card-box');
const cardsBoxCloseBtn = document.querySelector('#cards-box__closeBtn');

document.addEventListener('click', (e) => {
    if (e.target.className === 'card-img-overlay') {
        dataIndex = e.target.parentNode.parentNode.dataset['index'];

        selectorShowOrHide(true, noteEditPop);
        selectorShowOrHide(false, noteAddPop);
        popUpShow(yearAndMonth);
        setText(data, dataIndex);
    }
});

noteEditPop.addEventListener('click', () => {
    const noteIndex = dataIndex;
    const datas = data;
    let title = null;
    let content = null;

    datas.forEach((data) => {
        const index = data['index'];

        if (index === Number(noteIndex)) {
            title = data['title'];
            content = data['content'];
        } else {
            return;
        }
    });

    const dailyData = updateAjax(noteIndex, title, content);
    show_daily(dailyData);
    removeText();
});

noteAddPop.addEventListener('click', () => {
    const dailyData = saveAjex(yearAndMonth, day);
    show_daily(dailyData);
    data = dailyData;
    removeText();
});

function show_daily(datas) {
    $('#card-box').empty();

    datas.forEach((datas) => {
        const index = datas['index'];
        const title = datas['title'];
        const content = datas['content'];

        const temp_html = `
  <div class="col" data-index="${index}">
    <div class="cards-box__category">
        <button class="cards-box__closeBtn">X</button>
      </div>
    <div class="card bg-dark text-black">
      <img src="/static/img/note.png" class="card-img" alt="..." />
      <div class="card-img-overlay">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${content}</p>
      </div>
    </div>
  </div>
  `;

        $('#card-box').append(temp_html);
    });

    closePopup();
}

document.addEventListener('click', (e) => {
    if (e.target.className === 'cards-box__closeBtn') {
        const index = e.target.parentNode.parentNode.dataset.index;
        const datas = deleteAjax(index);
        data = showAjax();
        show_daily(data);
    }
});

//===================== 팝업 =========================

$(document).ready(function () {
    $(document).on('click', '#note-add', function (e) {
        selectorShowOrHide(false, noteEditPop);
        selectorShowOrHide(true, noteAddPop);
        popUpShow();
    });
});

function setText(datas, noteIndex) {
    datas.forEach((data) => {
        const index = data['index'];
        const title = data['title'];
        const content = data['content'];

        if (index === Number(noteIndex)) {
            $('#notePop__title').val(title);
            $('#note-text').val(content);
        } else {
            return;
        }
    });
}

function removeText() {
    $('#notePop__title').val('');
    $('#note-text').val('');
}

function popUpShow() {
    $('#notePop')
        .fadeIn(300, function () {
            $('#notePop').focus();
        })
        .addClass('reveal');
    $('body').addClass('has-url');
}

$('#close__notePop').click(function () {
    closePopup();
    removeText();
});

function closePopup() {
    $('#close__notePop').closest('#notePop').removeClass('reveal').fadeOut(200);
    $('body').removeClass('has-url');
}

const calendarBack = document.querySelector('#calendar-back');

calendarBack.addEventListener('click', () => {
    window.location.reload();
    selectorShowOrHide(false, mainPageList);
});

// ============ Ajax 통신 ==============

function showAjax() {
    let data = {};

    const tokenId = document.querySelector('.logo').getAttribute('data-id');

    $.ajax({
        type: 'POST',
        url: '/show_daily',
        data: {
            id_give: tokenId,
            yyyyMM_give: yearAndMonth,
            day_give: day,
        },
        async: false,
        success: function (response) {
            data = response['daily_list'];
        },
        error: function () {
            alert('에러 발생');
        },
    });

    return data;
}

function saveAjex(yearAndMonth, day) {
    let data = {};

    const tokenId = document.querySelector('.logo').getAttribute('data-id');
    let title = $('#notePop__title').val();
    let content = $('#note-text').val();

    $.ajax({
        type: 'POST',
        url: '/save_daily',
        data: {
            id_give: tokenId,
            title_give: title,
            content_give: content,
            yyyyMM_give: yearAndMonth,
            day_give: day,
        },
        async: false,
        success: function (response) {
            data = response['daily_list'];
        },
        error: function () {
            alert('에러 발생');
        },
    });

    return data;
}

function updateAjax(index, title, content) {
    let data = {};
    const tokenId = document.querySelector('.logo').getAttribute('data-id');

    $.ajax({
        type: 'POST',
        url: '/update_daily',
        data: {
            id_give: tokenId,
            index_give: index,
            title_give: title,
            content_give: content,
            yyyyMM_give: yearAndMonth,
            day_give: day,
        },
        async: false,
        success: function (response) {
            data = response['daily_list'];
        },
        error: function () {
            alert('에러 발생');
        },
    });

    return data;
}

function deleteAjax(index) {
    $.ajax({
        type: 'POST',
        url: '/delete_daily',
        data: {
            give_index: index,
        },
        async: false,
        success: function (response) {
            response['msg'];
        },
        error: function () {
            alert('에러 발생');
        },
    });
}
