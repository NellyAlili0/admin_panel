@profile.route('/bills/<string:page>', methods=['GET', 'POST'])
def billing_each(page):
    if page == 'pay':
        if request.method == 'POST':
            # initiate transactions
            phone = request.json['phone']
            ref = request.json['ref']
            amount = request.json['amount']
            code_pay = request.json['code']
            access_token = generate_token()
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            stk_password = base64.b64encode((mpesa_shortcode + mpesa_passkey + timestamp).encode()).decode()
            tx_ref = uuid.uuid4().hex
            headers = {
                'Authorization': 'Bearer '+access_token,
                'Content-Type': 'application/json'
            }
            body = {
                "BusinessShortCode": mpesa_shortcode,
                "Password": stk_password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": "%s" % amount,
                "PartyA": phone,
                "PartyB": mpesa_shortcode,
                "PhoneNumber": phone,
                "CallBackURL": "https://webhook.site/d94d2f6b-1797-4a42-a149-3fe3abc1bb67",
                "AccountReference": code_pay,
                "TransactionDesc": ref
            }
            url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
            r = requests.post(url, json=body, headers=headers)
            if r.status_code == 200:
                checkout_id = r.json()['CheckoutRequestID']
                #sql = "update billing set checkout_id = '%s' where billing.tx_ref = '%s' AND billing.\"Status\" = 0 returning id;" % (checkout_id, ref)
                #db(sql,'update')
                return jsonify({'status': 'success', 'tx_ref': ref })
            else:
                return jsonify({'status':'error'})
    elif page == 'verify':
        tx_ref = request.json['tx_ref']
        check = db("select billing.checkout_id, billing.\"Status\", billing.\"Kind\", billing.driver_id, billing.school_id, billing.parent_id, billing.\"Amount\", billing.\"Fees\", billing.ref_id from billing where tx_ref = '%s' limit 1;" % tx_ref)
        if check:
            checkout_id = check[0]
            status = check[1]
            if status == 1:
                return jsonify({'status':'success'})
            else:
                checkout_id = checkout_id # ws_CO_260520211133524545
                access_token = generate_token()
                timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
                stk_password = base64.b64encode((mpesa_shortcode + mpesa_passkey + timestamp).encode()).decode()
                tx_ref = uuid.uuid4().hex
                headers = {
                    'Authorization': 'Bearer '+access_token,
                    'Content-Type': 'application/json'
                }
                body={    
                    "BusinessShortCode": mpesa_shortcode,    
                    "Password": stk_password,    
                    "Timestamp":timestamp,    
                    "CheckoutRequestID": checkout_id,    
                }
                url = "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query"
                r = requests.post(url, json=body, headers=headers)
                if r.status_code == 200:
                    resp = r.json()
                    if resp['ResponseCode'] == '0':
                        return jsonify({'status': 'success'})
                    else:
                        return jsonify({'status': 'pending'})
        else:
            return jsonify({'status':'error'})
    elif page == 'confirmation':
        # recieve c2b confirmation
        req = request.get_json()
        # print(req)
        # r = requests.post('https://webhook.site/d94d2f6b-1797-4a42-a149-3fe3abc1bb67', json=req)
        tran_id = req['TransID']
        amount = req['TransAmount']
        refnumber = req['BillRefNumber']
        check = db("select billing.id, billing.parent_id, billing.school_id, billing.ref_id from billing left join parents on parents.id = billing.parent_id where parents.\"Phone\" = '%s' AND billing.\"Status\" = 0;" % (refnumber))
        if check:
            billing_id = check[0]
            parent_id = check[1]
            school_id = check[2]
            # ref_id = check[3]
            db("update billing set \"Status\" = 1 where billing.id = %s AND billing.\"Status\" = 0 returning id;" % billing_id, 'update')
            if parent_id:
                # get ref id and activate the assigned ride. 
                ride_assign = db("SELECT * FROM rides_assign left join rides on rides.id = rides_assign.ride_id left join parents on parents.id = rides.parent_id WHERE parents.\"Phone\" = '%s' order by rides_assign.id desc limit 1;" % refnumber) # db("SELECT * FROM rides_assign WHERE rides_assign.id = %s" % ref_id)
                ride_id = ride_assign[0]
                driver_id = ride_assign[2]
                comments = ride_assign[5]
                # update ride_assign info
                db("UPDATE rides_assign SET \"Status\" = 1 where rides_assign.id = %s returning id;" % str(ride_assign[0]) , 'update')
                ride_info = db("select rides.student_id, students.\"Name\", students.\"Class\", schools.\"School\" as school, schools.\"Location\", parents.\"Name\", parents.\"Phone\", parents.\"Email\" as parent_email, schools.\"Email\" as school_email, rides.school_fleet, rides.\"Pickup\", rides.\"Drop-off\", rides.\"Picktime\", rides.\"Droptime\", rides.\"Distance\", rides.\"Comments\", rides.\"Start_date\", rides.\"End_date\", rides.cordinates from rides left join students on students.id = rides.student_id left join parents on parents.id = rides.parent_id left join schools on schools.id = rides.school_id where rides.id = %s ;" % ride_id)
                student_id = ride_info[0]
                start_date = ride_info[16]
                end_date = ride_info[17]
                # Get ride_assign info and driver_id
                # Generate daily trips
                sql = """ 
                INSERT INTO daily_trips (ride_id, driver_id, student_id, created_at, school_day)
                    SELECT
                        %s,%s,%s, generated_date,
                        CASE
                            WHEN EXTRACT(ISODOW FROM generated_date) IN (6, 7) THEN false
                            ELSE true
                        END AS school_day
                    FROM generate_series('%s'::date, '%s'::date, interval '1 day') AS generated_date returning id;
                """ % (ride_id, driver_id, student_id, start_date, end_date)
                db(sql, 'insert')
                # send reciept for parent
                # add notification for driver and for parent
                db("insert into notifications (parent_id, \"Level\", \"Kind\", \"Message\", \"Status\") values (%s, 'High', 'Payment', 'Your Payment has been recieved. A reciept has been sent to your email', 0) returning id;" % parent_id, 'insert')
                student_name = ride_info[1]
                db("insert into notifications (driver_id, \"Level\", \"Kind\", \"Message\", \"Status\") values (%s, 'High', 'Rides Assigned', 'Rides for %s have been assigned starting from %s to %s', 0) returning id;" % (driver_id, student_name, start_date, end_date), 'insert')
                if school_id:
                    # send notification, send reciept information
                    db("insert into notifications (school_id, \"Level\", \"Kind\", \"Message\", \"Status\") values (%s, 'High', 'Payment', 'Payments for %s has been recieved and rides have been successfully assgined', 0) returning id;" % (school_id, student_name), 'insert')
                    
        return jsonify({
            "ResultCode":0,
            "ResultDesc":"Confirmation received successfully"
        })
    elif page == 'validation':
        req = request.get_json()
        r = requests.post('https://webhook.site/d94d2f6b-1797-4a42-a149-3fe3abc1bb67', json=req)
        # return jsonify({
        #     "ResultCode":0,
        #     "ResultDesc":"Confirmation received successfully"
        # })
        tran_id = req['TransID']
        amount = req['TransAmount']
        refnumber = req['BillRefNumber']
        check = db("select billing.id from billing left join parents on parents.id = billing.parent_id where parents.\"Phone\" = '%s' AND billing.\"Status\" = 0;" % (refnumber))
        # check if refnumber and amount are in DB and are set as 0
        if check:
            # C2B00012, C2B00013
            return jsonify({
                "ResultCode":0,
                "ResultDesc":"Confirmation received successfully"
            })
        else:
            return jsonify({"ResultCode": 1, "ResultDesc": "Rejected"})
    elif page == 'callback':
        data = request.get_json()
        code = data['Body']['stkCallback']['ResultCode']
        if code == 0:
            amount = data['Body']['stkCallback']['CallbackMetadata']['Item'][0]['Value']
            checkout_id = data['Body']['stkCallback']['CheckoutRequestID']
            reciept = data['Body']['stkCallback']['CallbackMetadata']['Item'][1]['Value']
            tran_date = data['Body']['stkCallback']['CallbackMetadata']['Item'][3]['Value']
            phone = data['Body']['stkCallback']['CallbackMetadata']['Item'][4]['Value']
            check = db("select billing.id, billing.parent_id, billing.school_id, billing.ref_id from billing left join parents on parents.id = billing.parent_id where billing.checkout_id = '%s' AND billing.\"Status\" = 0;" % (checkout_id, amount))
            if check:
                billing_id = check[0]
                parent_id = check[1]
                school_id = check[2]
                ref_id = check[3]
                db("update billing set \"Status\" = 1 where billing.id = %s AND billing.\"Status\" = 0 returning id;" % billing_id, 'update')
                if parent_id:
                    # get ref id and activate the assigned ride. 
                    ride_assign = db("SELECT * FROM rides_assign WHERE rides_assign.id = %s" % ref_id)
                    ride_id = ride_assign[1]
                    driver_id = ride_assign[2]
                    comments = ride_assign[5]
                    # update ride_assign info
                    db("UPDATE rides_assign SET \"Status\" = 1 where rides_assign.id = %s returning id;" % ref_id , 'update')
                    ride_info = db("select rides.student_id, students.\"Name\", students.\"Class\", schools.\"School\" as school, schools.\"Location\", parents.\"Name\", parents.\"Phone\", parents.\"Email\" as parent_email, schools.\"Email\" as school_email, rides.school_fleet, rides.\"Pickup\", rides.\"Drop-off\", rides.\"Picktime\", rides.\"Droptime\", rides.\"Distance\", rides.\"Comments\", rides.\"Start_date\", rides.\"End_date\", rides.cordinates from rides left join students on students.id = rides.student_id left join parents on parents.id = rides.parent_id left join schools on schools.id = rides.school_id where rides.id = %s ;" % ride_id)
                    student_id = ride_info[0]
                    start_date = ride_info[16]
                    end_date = ride_info[17]
                    # Get ride_assign info and driver_id
                    # Generate daily trips
                    sql = """ 
                    INSERT INTO daily_trips (ride_id, driver_id, student_id, created_at, school_day)
                        SELECT
                            %s,%s,%s, generated_date,
                            CASE
                                WHEN EXTRACT(ISODOW FROM generated_date) IN (6, 7) THEN false
                                ELSE true
                            END AS school_day
                        FROM generate_series('%s'::date, '%s'::date, interval '1 day') AS generated_date returning id;
                    """ % (ride_id, driver_id, student_id, start_date, end_date)
                    db(sql, 'insert')
                    # send reciept for parent
                    # add notification for driver and for parent
                    db("insert into notifications (parent_id, \"Level\", \"Kind\", \"Message\", \"Status\") values (%s, 'High', 'Payment', 'Your Payment has been recieved. A reciept has been sent to your email', 0) returning id;" % parent_id, 'insert')
                    student_name = ride_info[1]
                    db("insert into notifications (driver_id, \"Level\", \"Kind\", \"Message\", \"Status\") values (%s, 'High', 'Rides Assigned', 'Rides for %s have been assigned starting from %s to %s', 0) returning id;" % (driver_id, student_name, start_date, end_date), 'insert')
                    if school_id:
                        # send notification, send reciept information
                        db("insert into notifications (school_id, \"Level\", \"Kind\", \"Message\", \"Status\") values (%s, 'High', 'Payment', 'Payments for %s has been recieved and rides have been successfully assgined', 0) returning id;" % (school_id, student_name), 'insert')
        return jsonify({'status':'success'}), 200