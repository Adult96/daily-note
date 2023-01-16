from flask import Flask, render_template, request, jsonify
import requests
import json
import hashlib
import datetime
import logging
import traceback
import jwt

from pymongo import MongoClient

client = MongoClient(
    "mongodb+srv://miniproject:sparta@cluster0.bqlznzm.mongodb.net/?retryWrites=true&w=majority")
db = client.dbsparta

# 웹스크래핑 bs4 패키지 추가

# Flask 기본 코드

app = Flask(__name__)

SECRET_KEY = "12jo"

#============================index home=====================
@app.route('/')
def home():
    return render_template('index.html')

#============================signin=====================

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == "POST":
        id_receive = request.form['id_give']
        pw_receive = request.form['pw_give']
        pw_check_receive = request.form['pw_check_give']

        hash_pw = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest();

        if pw_check_receive == '':
            login = db.login.find_one({'id': id_receive}, {'_id': False})

            if login['password'] == hash_pw:
                return jsonify({'complete': '로그인 완료'})
            else:
                return jsonify({'fail': '로그인 실패'})
        else:
            login_list = list(db.login.find(
                {'id': id_receive}, {'_id': False}))
            check_cnt = len(login_list)

            print(login_list, check_cnt)

            if check_cnt > 0:
                return jsonify({'error': '동일한 아이디가 존재 합니다'})

            doc = {
                'id': id_receive,
                'password': hash_pw
            }

            db.login.insert_one(doc)

        return jsonify({'create': '가입 완료'})
    else:
        return render_template('login.html')


@app.route("/token", methods=["POST"])
def make_token():
    id_receive = request.form['id_give']
    password_receive = request.form['password_give']

    hash_pw = hashlib.sha256(password_receive.encode('utf-8')).hexdigest();

    login_result = db.login.find_one({'id': id_receive, 'password': hash_pw}, {'_id': False})

    if login_result is not None:
        # jwt 토큰 사용 시, SECRET_KEY 가 있어야 payload값을 볼 수 있다.
        payload = {
            'id': id_receive,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60)  # 토큰 유효시간
        }
        # jwt 암호화 
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')#.decode('utf-8')#로컬 환경 = .decode('utf-8') 사용 Line 87
        #호스팅 서버 = .decode('utf-8') 없앰 Line 87
        
        print('payload')
        # 로그인 시 token을 준다.
        return jsonify({'result': 'success', 'token': token})
				
    # 데이터가 없으면
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})

#============================main=====================
@app.route('/main')
def main():
    token_receive = request.cookies.get('mytoken')
    
    print('토큰 받음')
    print(token_receive)
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        print(payload)
        return render_template('main.html', id = payload['id'])
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        print(logging.error(traceback.format_exc()))
        return render_template('login.html')

@app.route("/show_daily", methods=["POST"])
def show_daily():
    id_receive = request.form['id_give']
    yyyyMM_receive = request.form['yyyyMM_give']
    day_receive = request.form['day_give']

    daily_list = list(db.daily.find({'id':id_receive, 'yyyyMM':yyyyMM_receive,'dd' : day_receive,},{'_id': False}))
    return jsonify({'daily_list':daily_list})

@app.route("/save_daily", methods=["POST"])
def save_daily():
    id_receive = request.form['id_give']
    title_receive = request.form['title_give']
    content_receive = request.form['content_give']
    yyyyMM_receive = request.form['yyyyMM_give']
    day_receive = request.form['day_give']

    daily_list = list(db.daily.find({}, {'_id': False}))
    index = len(daily_list) + 1

    doc = {
        'index': index,
        'id': id_receive,
        'yyyyMM': yyyyMM_receive,
        'dd' : day_receive,
        'title': title_receive,
        'content': content_receive,
    }

    db.daily.insert_one(doc)

    daily_list = list(db.daily.find({'id':id_receive, 'yyyyMM':yyyyMM_receive,'dd':day_receive},{'_id': False}))
    return jsonify({'daily_list': daily_list})    

@app.route("/update_daily", methods=["POST"])
def update_daily():
    id_receive = request.form['id_give']
    index_receive = request.form["index_give"]
    index = int(index_receive)
    title_receive = request.form["title_give"]
    content_receive = request.form["content_give"]
    yyyyMM_receive = request.form['yyyyMM_give']
    day_receive = request.form['day_give']

    print(index_receive,id_receive,yyyyMM_receive,day_receive,title_receive,content_receive)
    
    filter = {'index': index_receive}
 
    newvalues = { "$set": { 'company': "sony" } }

    db.daily.update_one(filter,newvalues)
    
    daily_list = list(db.daily.find({'id':id_receive, 'yyyyMM':yyyyMM_receive,'dd':day_receive},{'_id': False}))

    return jsonify({'daily_list': daily_list})    

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)