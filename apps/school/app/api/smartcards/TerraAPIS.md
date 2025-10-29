# Terra API Routes

## GET APIS

### Getting the tags

- Getting all accounts tags
  [text](http://api.terrasofthq.com/api/tags/?page=true&entity=account)
- Getting all zone tags
  [text](http://api.terrasofthq.com/api/tags/?page=true&entity=zone)
- Getting all children tags
  [text](http://api.terrasofthq.com/api/tags/?page=true&entity=dependant)

### Getting the parents acccouts

[text](https://api.terrasofthq.com/api/accounts?tags[]=1b8d5703-b389-4d55-bc53-466ed165f294)

### Getting a single parent

[text](https://api.terrasofthq.com/api/accounts/0d4ea117-2ee9-4cde-98b3-d22b379b93b3)

### Getting the childrens data (dependants)

[text](https://api.terrasofthq.com/api/dependants?tags[]=8b308c54-24a2-45fa-9460-f3fec457bd30)

### Getting all childrens for a specific child

### Getting all zones for a specific zone

<https://api.terrasofthq.com/api/zone?tags[]=0f8545ae-305b-4f20-875f-6fb005534e48>

## POST APIS

### creating a new parent

[text](https://api.terrasofthq.com/api/accounts)

### creating a new student

[text](https://api.terrasofthq.com/api/dependants)

## creating a new zone

[text](https://api.terrasofthq.com/api/zone)
