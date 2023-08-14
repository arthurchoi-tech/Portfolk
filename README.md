This Portfolk WebApp (PortfolioSharingWebsite) is for COMP2068-Assignment 2b
The live URL is: portfolk.azurewebsites.net

The optional feature that I incorporated into my app is file upload. 

Previously I was trying to build a MEAN webapp for the assignment but it turned out much more complicated than I thought. As a result, a new app using express-hbs is built in place of the original MEAN app: https://github.com/ka-wai-choi/PortfolioSharingWebsite

There are more than 4 commits in total for both MEAN and express-hbs app. I first built MEAN app from 10-Aug (Thu) and replace it entirely with express-hbs app on 13-Aug (Sun): https://github.com/ka-wai-choi/Portfolk

In this application, user will be able to share their portfolio(s) with other users. Only registered user will be able to post a new portfolio. Only the author will be able to edit/ delete their own portfolio (they won't see the buttons if they are not the author). For categories, all users can only view but not add/ edit. Only admin (REDACTED) will be able to do so. 