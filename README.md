Approach:

From the assessment, there has to be a schema for an invoice with invoice details and arrays of items and sundries. I have defined a schema for this. For the auto increment, im using the mongoose-sequence plugin.
In the express server, I have defined routes for creation, updation,deletion and retreival and listing.
For creation, I wrote a validation function that would validate the invoice and then add it.
The retreival and deletion use id given in the parameters to act on that specific invoice.
For updation, I wrote a mongodb schema method where I pass an array of items or sundries to be added onto the invoice. This is done isntead of a custom server function, as mongodb methods are faster and in this way will batch requests and optimize functioning. 
 




Improvements to be made:

Test functioning of mongodb connections and methods with a frontend or POSTMAN,Eclipse etc.

Implement authentication using custom service, OAUTH2.0 or third party like CLOAK and apply it for all routes so that only authorized users can make requests.

