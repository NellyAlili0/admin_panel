# Zones API by Terra

## Create Zone - POST

This endpoint creates a zone.

POST is the HTTP method that is designed to send loads of data to a server from a specified resource.

`kub.terrasofthq.com/api/zone`

```
Sample API Request Body
{
    "name":"MyZoneKENYA",
    "note":"MZONEKENYA",
    "status":"Active",
    "expiry_date":"2030-01-01 20:22:01"
}
```

Sample Response

```

{
    "status": 200,
    "data": {
    "id": "3d5224cc-9bbf-4982-afc4-33b174a3adbf",
    "name": "MyZone",
    "expiry_date": "2024-01-01 20:22:01",
    "note": "MZONE",
    "groups": [],
    "company": {
    "id": "c63894d5-6ee5-46a4-a3bc-f2367e1b8d6e",
    "name": "Mzalendo Njenga"
    },
    "added_by": {
    "id": "663bd7c5-1b2b-4bf6-b5c0-57161bc83e0e",
    "name": "Njenga Elijah"
    },
    "created_at": "Mon, Oct 30, 2023 1:38 AM"
    },
    "message": "Successfully added a zone"
}

```

## Update Zone - PUT

This API endpoint allows you to update a specific zone by sending an HTTP PUT request to the specified URL;
`kub.terrasofthq.com/api/zone/{zone ID}`

    The URL should include the ID of the zone you want to update.

Use PUT or PATCH request.
PUT is a method of modifying resource where the client sends data that updates the entire resource.

Sample Request Body

```
{
    "name":"MyZoneKEN",
    "note":"MZONEKEN",
    "status":"Active",
    "expiry_date":"2031-01-01 20:22:01"
}
```

Sample Response

```
{
    "status": 200,
    "data": {
    "id": "a2b19979-39df-40c8-8ef4-564b097ecb85",
    "name": "MyZoneA",
    "expiry_date": "2024-01-01 20:22:01",
    "note": "MZONE",
    "groups": [],
    "company": {
    "id": "c63894d5-6ee5-46a4-a3bc-f2367e1b8d6e",
    "name": "Mzalendo Njenga"
    },
    "added_by": {
    "id": "663bd7c5-1b2b-4bf6-b5c0-57161bc83e0e",
    "name": "Njenga Elijah"
    },
    "created_at": "Fri, Nov 3, 2023 7:35 PM"
    },
    "message": "zone updated"
}
```

Failed response:

```
{
    "status": 1,
    "data": {},
    "message": "Invalid zone ID"
}
```

## Delete Zone - DELETE

This endpoint deletes a zone.
The zone id is passed in the url
The HTTP DELETE request method deletes the specified resource.

`kub.terrasofthq.com/api/zone/{id}/delete`

Sample Response

```
{
    "status":200,
    "data":[],
    "message":"Successfully deleted zone"
}
```

## Get Zones - GET

Zones are for access control.

E.g if you want to run access control for a school edtech platform, a zone could be like a class. If it's a music festival and we are running cashless payments, we will create zones such as Main entrance, VIP area, Backstage e.t.c

Zones are just areas where access control validation will be occurring.

The GET method refers to the HTTP method that is applied while requesting information from a particular source.

API Link
You can access the API endpoints at API Reference.

API Request
The App key and Authorization can be copied from the portal. The example uses Javascript fetch. There are multiple ways to query the api.

`kub.terrasofthq.com/api/zone`

Sample Response

```
{
"status": 200,
"data": [
{
"id": "2dd3b937-41e5-4374-af86-71f983c85dcd",
"name": "Friends Party",
"expiry_date": null,
"note": "Wine tasting for invited friends only",
"company": {
"id": "8f80ea6a-c8d1-4a0c-8233-c4e245a19533",
"name": "TERRA"
},
"added_by": {
"id": "128052fa-ce21-4823-a8b5-eb095ad91cb9",
"name": "Julius Kimani Karanja"
},
"created_at": "Jan 23, 2023"
},
{
"id": "b91cd1ea-0df4-4b14-8150-13a94903f4c6",
"name": "Friends Party - (invited)",
"expiry_date": null,
"note": "Wine tasting for invited friends only",
"company": {
"id": "8f80ea6a-c8d1-4a0c-8233-c4e245a19533",
"name": "TERRA"
},
"added_by": {
"id": "128052fa-ce21-4823-a8b5-eb095ad91cb9",
"name": "Julius Kimani Karanja"
},
"created_at": "Jan 23, 2023"
},
{
"id": "187364bd-f16b-4c1a-894f-7d9391f1bf70",
"name": "Friends Wine tasting Party",
"expiry_date": "2029-03-10 23:39:00",
"note": "Invited guest only",
"company": {
"id": "8f80ea6a-c8d1-4a0c-8233-c4e245a19533",
"name": "TERRA"
},
"added_by": {
"id": "128052fa-ce21-4823-a8b5-eb095ad91cb9",
"name": "Julius Kimani Karanja"
},
"created_at": "Jan 23, 2023"
}
],
"message": "success"
}
```

## Get Single Zone - GET

This API endpoint is used to retrieve information about a specific zone.

Zones are areas where access control validation will be occurring.

The GET method refers to the HTTP method that is applied while requesting information from a particular source.

To retrieve zone information, send a GET request to

`kub.terrasofthq.com/api/zone/{zoneID}/single`

sample Response

```
{
    "status": 200,
    "data": {
        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
        "name": "westlands",
        "expiry_date": "2025-05-06 00:00:00",
        "note": "westy",
        "status": "Active",
        "groups": [
            {
                "id": "26064485-ae4e-411c-bd1f-d47b19334ec5",
                "name": "Events",
                "cost_per_check_in": null,
                "note": null,
                "created_at": null
            },
            {
                "id": "a10cbaf2-8834-4d13-987d-db19cbc200ce",
                "name": "The Parking Group",
                "cost_per_check_in": null,
                "note": null,
                "created_at": null
            },
            {
                "id": "3e4973d5-f93e-4e71-9cbb-346e03c675f6",
                "name": "Media",
                "cost_per_check_in": null,
                "note": null,
                "created_at": null
            }
        ],
        "access_log_stats": {
            "all": 94,
            "success": 0,
            "denied": 1
        },
        "access_logs": {
            "current_page": 1,
            "data": [
                {
                    "id": "49632aee-b937-41e6-b6f2-4dc3bc0b73f7",
                    "code": "B20C4A9AHCG",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c9889e22-bd8c-44b0-85a4-432cf4b391eb",
                        "name": "32469534"
                    },
                    "status": "Denied",
                    "checkin_at": null,
                    "checkout_at": null,
                    "created_at": "Wed, Aug 14, 2024 12:39 PM",
                    "user": {
                        "id": "80c9f1f5-17b3-4659-8fd9-a1d3281b714a",
                        "phone": "",
                        "name": "Dependant Yyy Kenya",
                        "names": "Dependant Yyy Kenya"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "6ed0a68e-f8c1-440d-9187-2e772c66ba2b",
                    "code": "B20C4A9AI05",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked Out",
                    "checkin_at": "Thu, Aug 29, 2024 12:19 PM",
                    "checkout_at": "Thu, Aug 29, 2024 12:20 PM",
                    "created_at": "Thu, Aug 29, 2024 12:19 PM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "b1ce6fe8-5065-4256-b0e8-9eae544bff17",
                    "code": "B20C4A9AI06",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked In",
                    "checkin_at": "Thu, Aug 29, 2024 12:20 PM",
                    "checkout_at": null,
                    "created_at": "Thu, Aug 29, 2024 12:20 PM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "19cb7eb0-7e79-4038-92df-15387662bfae",
                    "code": "B20C4A9AI07",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked Out",
                    "checkin_at": "Thu, Aug 29, 2024 12:20 PM",
                    "checkout_at": "Thu, Aug 29, 2024 12:21 PM",
                    "created_at": "Thu, Aug 29, 2024 12:20 PM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "f837ce17-aa32-4c68-b1a7-d2454c453964",
                    "code": "B20C4A9AI08",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked In",
                    "checkin_at": "Thu, Aug 29, 2024 12:21 PM",
                    "checkout_at": null,
                    "created_at": "Thu, Aug 29, 2024 12:21 PM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "bc589ac4-e572-4b10-9422-7f98f28850ae",
                    "code": "B20C4A9AI09",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked Out",
                    "checkin_at": "Thu, Aug 29, 2024 12:21 PM",
                    "checkout_at": "Thu, Aug 29, 2024 12:23 PM",
                    "created_at": "Thu, Aug 29, 2024 12:21 PM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "1adb0535-ecc4-446e-9dcd-aa60671d787e",
                    "code": "B20C4A9AI0A",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked In",
                    "checkin_at": "Thu, Aug 29, 2024 12:29 PM",
                    "checkout_at": null,
                    "created_at": "Thu, Aug 29, 2024 12:29 PM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "33a28945-4a72-42cf-bd4b-5a5641e534e1",
                    "code": "B20C4A9AI0B",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked Out",
                    "checkin_at": "Thu, Aug 29, 2024 12:29 PM",
                    "checkout_at": "Thu, Aug 29, 2024 12:30 PM",
                    "created_at": "Thu, Aug 29, 2024 12:29 PM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "3cc99f49-911b-47ed-baac-79e2e5690d6a",
                    "code": "B20C4A9AI0C",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked In",
                    "checkin_at": "Thu, Aug 29, 2024 12:30 PM",
                    "checkout_at": null,
                    "created_at": "Thu, Aug 29, 2024 12:30 PM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "7c9e19e8-25a8-40a6-bb86-04b9a27a47c8",
                    "code": "B20C4A9AI0D",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked Out",
                    "checkin_at": "Thu, Aug 29, 2024 12:30 PM",
                    "checkout_at": "Thu, Aug 29, 2024 12:31 PM",
                    "created_at": "Thu, Aug 29, 2024 12:30 PM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "0e31bfef-09b8-4d76-a982-293df6c51eb9",
                    "code": "B20C4A9AI3E",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked In",
                    "checkin_at": "Wed, Sep 4, 2024 12:42 PM",
                    "checkout_at": null,
                    "created_at": "Wed, Sep 4, 2024 12:42 PM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "7e982926-d5b8-4552-af10-90e87bfefd01",
                    "code": "B20C4A9AI3F",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked Out",
                    "checkin_at": "Wed, Sep 4, 2024 4:59 PM",
                    "checkout_at": "Wed, Sep 4, 2024 4:59 PM",
                    "created_at": "Wed, Sep 4, 2024 4:59 PM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "fc03f943-79a1-45f3-9ff5-be3be3d99f14",
                    "code": "B20C4A9AI3G",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked Out",
                    "checkin_at": "Wed, Sep 4, 2024 5:00 PM",
                    "checkout_at": "Wed, Sep 4, 2024 5:02 PM",
                    "created_at": "Wed, Sep 4, 2024 5:00 PM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "bf3b6878-d842-4af4-b54d-ab7e806581ad",
                    "code": "B20C4A9AI3H",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked Out",
                    "checkin_at": "Thu, Sep 5, 2024 12:37 PM",
                    "checkout_at": "Thu, Sep 5, 2024 12:37 PM",
                    "created_at": "Thu, Sep 5, 2024 12:37 PM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                },
                {
                    "id": "ebcce4ad-ee8f-44d8-b772-61fe0ff31b24",
                    "code": "B20C4A9AI3R",
                    "zone": {
                        "id": "0b878bae-9d31-4a5f-95cf-487b7e9c5830",
                        "name": "westlands"
                    },
                    "iot": {
                        "id": "c224b316-6c29-46bd-a24d-a09acee6120f",
                        "name": "D340D771"
                    },
                    "status": "Checked Out",
                    "checkin_at": "Fri, Sep 6, 2024 11:40 AM",
                    "checkout_at": "Fri, Sep 6, 2024 11:40 AM",
                    "created_at": "Fri, Sep 6, 2024 11:40 AM",
                    "user": {
                        "id": "b2df47aa-9c13-4b2b-b9fc-7d1c8422b139",
                        "phone": "",
                        "name": "Shiko Warui",
                        "names": "Shiko Warui"
                    },
                    "user_type": "App\\Models\\Dependant"
                }
            ],
            "first_page_url": "http://kub.terrasofthq.com/api/zone/0b878bae-9d31-4a5f-95cf-487b7e9c5830/single?page=1",
            "from": 1,
            "last_page": 7,
            "last_page_url": "http://kub.terrasofthq.com/api/zone/0b878bae-9d31-4a5f-95cf-487b7e9c5830/single?page=7",
            "links": [
                {
                    "url": null,
                    "label": "« Previous",
                    "active": false
                },
                {
                    "url": "http://kub.terrasofthq.com/api/zone/0b878bae-9d31-4a5f-95cf-487b7e9c5830/single?page=1",
                    "label": "1",
                    "active": true
                },
                {
                    "url": "http://kub.terrasofthq.com/api/zone/0b878bae-9d31-4a5f-95cf-487b7e9c5830/single?page=2",
                    "label": "2",
                    "active": false
                },
                {
                    "url": "http://kub.terrasofthq.com/api/zone/0b878bae-9d31-4a5f-95cf-487b7e9c5830/single?page=3",
                    "label": "3",
                    "active": false
                },
                {
                    "url": "http://kub.terrasofthq.com/api/zone/0b878bae-9d31-4a5f-95cf-487b7e9c5830/single?page=4",
                    "label": "4",
                    "active": false
                },
                {
                    "url": "http://kub.terrasofthq.com/api/zone/0b878bae-9d31-4a5f-95cf-487b7e9c5830/single?page=5",
                    "label": "5",
                    "active": false
                },
                {
                    "url": "http://kub.terrasofthq.com/api/zone/0b878bae-9d31-4a5f-95cf-487b7e9c5830/single?page=6",
                    "label": "6",
                    "active": false
                },
                {
                    "url": "http://kub.terrasofthq.com/api/zone/0b878bae-9d31-4a5f-95cf-487b7e9c5830/single?page=7",
                    "label": "7",
                    "active": false
                },
                {
                    "url": "http://kub.terrasofthq.com/api/zone/0b878bae-9d31-4a5f-95cf-487b7e9c5830/single?page=2",
                    "label": "Next »",
                    "active": false
                }
            ],
            "next_page_url": "http://kub.terrasofthq.com/api/zone/0b878bae-9d31-4a5f-95cf-487b7e9c5830/single?page=2",
            "path": "http://kub.terrasofthq.com/api/zone/0b878bae-9d31-4a5f-95cf-487b7e9c5830/single",
            "per_page": 15,
            "prev_page_url": null,
            "to": 15,
            "total": 94
        },
        "company": {
            "id": "e994e446-50dd-4f3a-aa01-f6a584cb7502",
            "name": "Fresh Picks School"
        },
        "added_by": {
            "id": "eb5b3569-0138-475f-b5bd-eae413b3d7d5",
            "name": "Abed Mugambiiii"
        },
        "created_at": "Tue, May 14, 2024 1:05 PM"
    },
    "message": "zone"
}
```

## Check IN - POST

This API endpoint allows you to check in to a zone by sending an HTTP POST request to

`kub.terrasofthq.com/api/zone/check-in`

POST is the HTTP method that is designed to send loads of data to a server from a specified resource.

The request should include the following parameters in the request body:

zone_id (string): The ID of the zone to check in to.
serial_number (string): The serial number associated with the check-in.
Response
The API will respond with a JSON object containing the following properties:

Examples Request

```
{
"zone_id":"fb3d18ca-1688-46d6-8efe-bafbf02a8335",
"serial_number":"CXCXCXCX"
}
```

Response

```
{
    "status": 0,
    "data": {
    "id": "zone123",
    "name": "Zone 1",
    "expiry_date": "2022-12-31",
    "note": "This is a test zone",
    "groups": ["group1", "group2"],
    "company": {
    "id": "company1",
    "name": "Company A"
    },
    "added_by": {
    "id": "user1",
    "name": "John Doe"
    },
    "created_at": "2022-01-01T12:00:00Z"
    },
    "message": ""
}
```

## Check OUT - POST

This API endpoint allows you to check OUT of a zone by sending an HTTP POST request to
`kub.terrasofthq.com/api/zone/check-out`

POST is the HTTP method that is designed to send loads of data to a server from a specified resource.

Request body

```
{
    "zone_id":"0b878bae-9d31-4a5f-95cf-487b7e9c5830",
    "serial_number":"D340D771" // IOT serial number
}
```

sample response

```
{
    "status": 200,
    "data": "Checked out Successfully",
    "message": "success"
}
```

## Create Tags - POST

This endpoint allows you to create a new tag by sending a POST request to
`kub.terrasofthq.com/api/tags/`

POST is the HTTP method that is designed to send loads of data to a server from a specified resource.

sample request body

```
{
    "name":"NEW TAG ",
    "description": "NEW TAG Desc"
    "entity": null, //optional
    "color_code": null //optional
}
```

Request Body

- name (string, required): The name of the tag.
- description (string, required): The description of the tag.

  sample response

  ```
  {
    "status": 200,
    "data": {
    "id": "e9de3e54-cb57-4877-a710-b93223309938",
    "name": "C-suites",
    "description": "Management",
    "entity": null,
    "color_code": null
  },
    "message": "success"
  }
  ```

## Update Tags - PUT

This endpoint allows the user to update a specific tag by sending an HTTP PUT request with the Tag ID to the specified URL.
PUT is a method of modifying resource where the client sends data that updates the entire resource.

`kub.terrasofthq.com/api/tags/{tagID}`

tagID is e9de3e54-cb57-4877-a710-b93223309938

The request should include a payload with the tag's name and description in the raw request body.

Request Body

- name (string, required): The name of the tag.
- description (string, required): The description of the tag.

  Example Body Parameters for the request

```
{
    "id": "e9de3e54-cb57-4877-a710-b93223309938",
    "name": "C-suites",
    "description": "Management",
    "entity": "dependant"
}
```

Response

The response for this request is a JSON object with the following schema:

```
{
    "status": 200,
    "data": {
    "id": "e9de3e54-cb57-4877-a710-b93223309938",
    "name": "C-suites",
    "description": "Management",
    "entity": "dependant",
    "color_code": null
    },
    "message": "tag updated"
}
```

## Get Zone Tags - GET

This endpoint retrieves a list of tags assigned to a zone.

Entity=zone should be added as a query parameter to specify that the user wants to retrieve zone tags.

It sends a GET request to this URL:

`kub.terrasofthq.com/api/tags?entity=zone&search=&loading=false&page=1`

The GET method refers to the HTTP method that is applied while requesting information from a particular source.

Response

The response will be a JSON object with the following schema:

```
{
    "status": 200,
    "data": {
    "current_page": 1,
    "data": [
    {
    "id": "b63be533-badc-4523-8ffb-89a53319b5c0",
    "name": "Resources",
    "description": "Human",
    "entity": "dependant",
    "color_code": null
    },
    {
    "id": "45e29b20-5a65-452c-b26a-fa7f10b510e6",
    "name": "Engineers",
    "description": "Software",
    "entity": null,
    "color_code": null
    },
    {
    "id": "9af8c3c1-53df-4325-9e6b-6f43ca859809",
    "name": "Media",
    "description": "Digitial",
    "entity": "beneficiary",
    "color_code": null
    },
    ],
    "first_page_url": "http://kub.terrasofthq.com/api/tags?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://kub.terrasofthq.com/api/tags?page=1",
    "links": [
    {
    "url": null,
    "label": "« Previous",
    "active": false
    },
    {
    "url": "http://kub.terrasofthq.com/api/tags?page=1",
    "label": "1",
    "active": true
    },
    {
    "url": null,
    "label": "Next »",
    "active": false
    }
    ],
    "next_page_url": null,
    "path": "http://kub.terrasofthq.com/api/tags",
    "per_page": 15,
    "prev_page_url": null,
    "to": 7,
    "total": 7
    },
    "message": "success"
}
```

## Search Tags - POST

This endpoint is used to search for tags based on the provided term.
POST is the HTTP method that is designed to send loads of data to a server from a specified resource.

The URL to search tags is;

`kub.terrasofthq.com/api/tags/search-tags`

Request Body

- term (string, required): The term to search for tags.

Example Body Parameters for the request

```
{
    "term":"T"
}
```

The response will be a JSON object with the following schema:

```
{
    "status": 200,
    "data": [
    {
    "id": "163fc4d2-a4b9-4cf3-b7d8-8ea5fe13477c",
    "name": "TAG 1",
    "description": "TAG1 Desc"
    }
    ],
    "message": "tags"
}
```

## Delete Tags - DELETE

This endpoint is used to delete a specific tag identified by its unique ID.

The HTTP DELETE request method deletes the specified resource.

`kub.terrasofthq.com/api/tags/{tagID}`

Request
Method: DELETE

sample request
`kub.terrasofthq.com/api/tags/c85f0801-e334-4ede-9fd4-cd26fb59dc32`

Response
The response schema for this request is as follows:

```
{
    "status": 200,
    "data": [],
    "message": "tag deleted"
}
```

## Add Group to Zone - POST

This endpoint adds a group to a zone.
Zone ID is passed in the URL
POST is the HTTP method that is designed to send loads of data to a server from a specified resource.

`kub.terrasofthq.com/api/zone/{zone ID}`

sample request body

```
{
    "group_id":"3e4973d5-f93e-4e71-9cbb-346e03c675f6",
    "cost_per_check_in" : 10,
    "cost_frequency" : "once" // either once or every_login
}
```

Sample Response

```
{
    "status": 200,
    "data": {
    "id": "01ecba29-1274-4d07-996e-0bf2b57cf957",
    "name": "Friends re-union party",
    "expiry_date": "2024-08-29 23:59:59",
    "note": "Invited guests only",
    "groups": [
    {
    "id": "6fc5425b-307b-4bb2-9968-f8cd41b96602",
    "name": "main",
    "cost_per_check_in": "839.97"
    }
    ],
    "company": {
    "id": "8f80ea6a-c8d1-4a0c-8233-c4e245a19533",
    "name": "TERRA"
    },
    "added_by": {
    "id": "128052fa-ce21-4823-a8b5-eb095ad91cb9",
    "name": "Julius Kimani Karanja"
    },
    "created_at": "Jan 23, 2023"
    },
    "message": "Successfully added group to zone"
}
```

## Add Tag to Zone - POST

This HTTP PUT request is used to add a tag to a specific zone identified by its ID.

PUT is a method of modifying resource where the client sends data that updates the entire resource.

The request should be sent to the specified URL with Zone ID attached to it :

`kub.terrasofthq.com/api/tags/{zone_ID}/add-tags-zones`

Sample request payload

```
{
    "zone_id":"4706051e-f609-4f0e-a8f8-3672f516f3f8",
    "tags":[
    "373547d4-e497-4d25-a059-0040723f7d21"
    ]
}
```

Sample Response

```
{
    "status": 200,
    "data": {
    "data": [
    {
    "id": "373547d4-e497-4d25-a059-0040723f7d21",
    "name": "Mombasa Road",
    "description": "Mombasa Road",
    "entity": "dependant",
    "color_code": null
    }
    ],
    "success": 1,
    "msg": "Tags attached successfully"
    },
    "message": "Successfully added tag"
}
```

## Remove Tag From Zone - PUT

This API endpoint allows you to remove a tag from a specific zone by sending an HTTP PUT request to the specified URL.

PUT is a method of modifying resource where the client sends data that updates the entire resource.

`kub.terrasofthq.com/api/zone/{zone ID}/remove-tag`

Request
The request should include the following parameters in the request body:

tag_id: The ID of the tag to be removed from the zone.

```
{
    "tag_id":"b95a8fdf-0634-47fd-bf00-acb21f5cedf7"
}
```

Response
The response will include the following parameters:

- status: The status of the API request. A value of 0 indicates success.
- data: An object containing the details of the zone after the tag removal, including its ID, name, expiry date, note, groups, company, added by user, and creation timestamp.
- message: Any additional message or error information.

  Example Response

  ```
  {
    "status": 200,
    "data": {
    "id": "7241c55f-7268-4ce3-9af4-d72247b8badb",
    "name": "Soulfets",
    "description": "Trial",
    "status": "Active",
    "expiry_date": "2025-02-05 00:00:00",
    "created_at": "2025-01-16T07:51:36.000000Z",
    "updated_at": "2025-01-16T07:51:36.000000Z",
    "groups": [
    {
    "id": "a279e5a0-95bf-4acd-a367-3c5275f7c4a9",
    "name": "The Parking Group",
    "created_at": null
    }
    ],
    "whitelist_tags": [],
    "tags": [
    {
    "id": "8c0ef07f-d2a8-4b1a-a68c-5366d8f81f65",
    "name": "Areas",
    "description": "VIP",
    "entity": "zone",
    "color_code": null
    }
    ],
    "access_logs": {
    "all": 0,
    "success": 0,
    "denied": 0
    }
    },
    "message": "Successfully removed tag from zone"
  }
  ```

## Remove Group From Zone - PUT

This API endpoint allows you to remove a group from a specific zone by sending an HTTP PUT request to the specified URL.

PUT is a method of modifying resource where the client sends data that updates the entire resource.

`kub.terrasofthq.com/api/zone/{zone ID}/remove-group`

Request
The request should include the following parameters in the request body:

group_id: The ID of the group to be removed from the zone.

```
{
    "group_id":"3e4973d5-f93e-4e71-9cbb-346e03c675f6"

}
```

Response
The response will include the following parameters:

- status: The status of the API request. A value of 0 indicates success.
- data: An object containing the details of the updated zone, including its ID, name, expiry date, note, status, groups, company, added by user, and creation timestamp.
- id: The ID of the zone.
- name: The name of the zone.
- expiry_date: The expiry date of the zone.
- note: Any additional notes or comments about the zone.
- status: The status of the zone.
- groups: An array of groups associated with the zone, including their ID, name, cost per check-in, note, and creation timestamp.
- company: The company associated with the zone, including its ID and name.
- added_by: The user who added the zone, including their ID and name.
- created_at: The timestamp when the zone was created.
- message: Any additional message or error information.

Example Response

```
{
    "status": 200,
    "data": {
    "id": "7241c55f-7268-4ce3-9af4-d72247b8badb",
    "name": "Soulfets",
    "description": "Trial",
    "status": "Active",
    "expiry_date": "2025-02-05 00:00:00",
    "created_at": "2025-01-16T07:51:36.000000Z",
    "updated_at": "2025-01-16T07:51:36.000000Z",
    "groups": [],
    "whitelist_tags": [],
    "tags": [
    {
    "id": "8c0ef07f-d2a8-4b1a-a68c-5366d8f81f65",
    "name": "Areas",
    "description": "VIP",
    "entity": "zone",
    "color_code": null
    }
    ],
    "access_logs": {
    "all": 0,
    "success": 0,
    "denied": 0
    }
    },
    "message": "Successfully removed group from zone"
}
```

## Whitelist Dependant Tag - PUT

-This endpoint enables user to whitelist a Dependant tag to a specific Access ZONE.

This Dependant Tag has to have been created first through the Add dependant Tag API
PUT is a method of modifying resource where the client sends data that updates the entire resource.

`kub.terrasofthq.com/api/zone/{zone_ID}/whitelist-tag`

Sample request body

```
{
    "entity":"dependant",
    "tags":["2717cd13-e580-4e01-a609-5db3a876e99f"]
}
```

Sample response body

```
{
    "status": 200,
    "data": {
    "id": "fb3d18ca-1688-46d6-8efe-bafbf02a8335",
    "name": "KBJ 101D",
    "description": "Ruaka Ndenderu Route",
    "status": "Active",
    "expiry_date": "2026-12-10 21:00:00",
    "created_at": "2023-12-04T10:35:54.000000Z",
    "updated_at": "2025-01-06T13:22:56.000000Z",
    "groups": [
    {
    "id": "8ca1b654-5adc-4243-9f4c-459f6f15eaed",
    "name": "Uganda Wallets",
    "created_at": null
    },
    {
    "id": "0bb7c145-7e2d-4885-a422-0792d331dcc3",
    "name": "Kenya Wallets",
    "created_at": null
    }
    ],
    "whitelist_tags": [
    {
    "id": "23c64dda-ddd4-46e1-afd8-dc93ed013a0a",
    "name": "Mountain View School Parents",
    "description": "Mountain View School Parents",
    "entity": "account",
    "color_code": null
    },
    {
    "id": "2717cd13-e580-4e01-a609-5db3a876e99f",
    "name": "Kajiado Parents",
    "description": "descriptin",
    "entity": "dependant",
    "color_code": null
    }
    ],
    "tags": [
    {
    "id": "2bf8b100-e0df-41e0-96c6-453d7c0f079e",
    "name": "Zephr Dyer",
    "description": "Quis porro tempore",
    "entity": "zone",
    "color_code": null
    }
    ],
    "access_logs": {
    "all": 0,
    "success": 0,
    "denied": 0
    }
    },
    "message": "Successfully added tag to whitelist"
}
```

## Remove Dependant Tag from Whitelist - PUT

-This endpoint removes/detaches a whitelisted dependant tag from a specific Access zone

PUT is a method of modifying resource where the client sends data that updates the entire resource.

`kub.terrasofthq.com/api/zone/{zone_ID}/remove-tag-whitelist`

Sample request body

```
{
    "tag_id":"2717cd13-e580-4e01-a609-5db3a876e99f"
}
```

Sample response body

```
{
    "status": 200,
    "data": {
    "id": "fb3d18ca-1688-46d6-8efe-bafbf02a8335",
    "name": "KBJ 101D",
    "description": "Ruaka Ndenderu Route",
    "status": "Active",
    "expiry_date": "2026-12-10 21:00:00",
    "created_at": "2023-12-04T10:35:54.000000Z",
    "updated_at": "2025-01-06T13:22:56.000000Z",
    "groups": [
    {
    "id": "8ca1b654-5adc-4243-9f4c-459f6f15eaed",
    "name": "Uganda Wallets",
    "created_at": null
    },
    {
    "id": "0bb7c145-7e2d-4885-a422-0792d331dcc3",
    "name": "Kenya Wallets",
    "created_at": null
    }
    ],
    "whitelist_tags": [
    {
    "id": "23c64dda-ddd4-46e1-afd8-dc93ed013a0a",
    "name": "Mountain View School Parents",
    "description": "Mountain View School Parents",
    "entity": "account",
    "color_code": null
    }
    ],
    "tags": [
    {
    "id": "2bf8b100-e0df-41e0-96c6-453d7c0f079e",
    "name": "Zephr Dyer",
    "description": "Quis porro tempore",
    "entity": "zone",
    "color_code": null
    }
    ],
    "access_logs": {
    "all": 0,
    "success": 0,
    "denied": 0
    }
    },
    "message": "Successfully removed tag from whitelist"
}
```

## Whitelist Account Tag - PUT

This endpoint whitelists an account tag. (It attaches an account tag to a specific access zone)
PUT is a method of modifying resource where the client sends data that updates the entire resource.

`kub.terrasofthq.com/api/zone/{zone_ID}/whitelist-tag`

Sample request body

```
{
    "entity":"account",
    "tags":["98b5ce3a-49eb-4da6-a38f-f12c05127f86"]
}
```

Sample response body

```
{
    "status": 200,
    "data": {
    "id": "33029d12-b2db-4def-acdf-ea75cb84427e",
    "name": "SAFARI-WALK",
    "description": "ZONE ENTRY",
    "status": "Active",
    "expiry_date": "2024-01-31 10:04:00",
    "created_at": "2023-12-09T07:05:19.000000Z",
    "updated_at": "2024-03-06T18:04:07.000000Z",
    "groups": [
    {
    "id": "0bb7c145-7e2d-4885-a422-0792d331dcc3",
    "name": "Kenya Wallets",
    "created_at": null
    }
    ],
    "whitelist_tags": [
    {
    "id": "98b5ce3a-49eb-4da6-a38f-f12c05127f86",
    "name": "Kajiado Parents",
    "description": "Kajiado Parents",
    "entity": "account",
    "color_code": null
    }
    ],
    "tags": [],
    "access_logs": {
    "all": 0,
    "success": 0,
    "denied": 0
    }
    },
    "message": "Successfully added tag to whitelist"
}
```

## Remove Account Tag from Whitelist - PUT

-This endpoint removes/detaches a whitelisted account tag from a specific Access zone

PUT is a method of modifying resource where the client sends data that updates the entire resource.

`kub.terrasofthq.com/api/zone/{zone_ID}/remove-tag-whitelist`

Sample request body

```
{
    "tag_id":"98b5ce3a-49eb-4da6-a38f-f12c05127f86"
}
```

Sample response body

```
{
    "status": 200,
    "data": {
    "id": "33029d12-b2db-4def-acdf-ea75cb84427e",
    "name": "SAFARI-WALK",
    "description": "ZONE ENTRY",
    "status": "Active",
    "expiry_date": "2024-01-31 10:04:00",
    "created_at": "2023-12-09T07:05:19.000000Z",
    "updated_at": "2024-03-06T18:04:07.000000Z",
    "groups": [
    {
    "id": "0bb7c145-7e2d-4885-a422-0792d331dcc3",
    "name": "Kenya Wallets",
    "created_at": null
    }
    ],
    "whitelist_tags": [],
    "tags": [],
    "access_logs": {
    "all": 0,
    "success": 0,
    "denied": 0
    }
    },
    "message": "Successfully removed tag from whitelist"
}
```

### Please note that the response examples provided are placeholders and may not reflect the actual data returned by the API.
