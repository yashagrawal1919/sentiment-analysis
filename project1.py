import re 
import tweepy 
from tweepy import OAuthHandler 
from textblob import TextBlob 
import sys
  
class TwitterClient(object): 
    
    def __init__(self): 
        
        consumer_key = 'qJ14NxTNj8xxxxxxxxxx'
        consumer_secret = 'hJYpqfMexxxxxxxxxxxxxxxxx'
        access_token = '10460887659xxxxxxxxxxxxx'
        access_token_secret = 'zVWKo6NPDzexxxxxxxxxxxxx'
  
        try: 
            self.auth = OAuthHandler(consumer_key, consumer_secret) 
            self.auth.set_access_token(access_token, access_token_secret) 
            self.api = tweepy.API(self.auth) 
        except: 
            print("Error: Authentication Failed") 
  
    def clean_tweet(self, tweet): 
        return ' '.join(re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)", " ", tweet).split()) 
  
    def get_tweet_sentiment(self, tweet): 
        analysis = TextBlob(self.clean_tweet(tweet)) 
        if analysis.sentiment.polarity > 0: 
            return 'positive'
        elif analysis.sentiment.polarity == 0: 
            return 'neutral'
        else: 
            return 'negative'
  
    def get_tweets(self, query, count = 10): 
         
        tweets = [] 
  
        try: 
            fetched_tweets = self.api.search(q = query, count = count) 
  
            for tweet in fetched_tweets: 
                parsed_tweet = {} 
  
                parsed_tweet['text'] = tweet.text 
                parsed_tweet['sentiment'] = self.get_tweet_sentiment(tweet.text) 
  
                if tweet.retweet_count > 0: 
                    if parsed_tweet not in tweets: 
                        tweets.append(parsed_tweet) 
                else: 
                    tweets.append(parsed_tweet) 
  
            return tweets 
  
        except tweepy.TweepError as e: 
            print("Error : " + str(e)) 
  
def main(): 
    api = TwitterClient() 
    tweets = api.get_tweets(query = sys.argv[1], count = 200) 
  
    ptweets = [tweet for tweet in tweets if tweet['sentiment'] == 'positive'] 
    print("Positive tweets percentage: {} %".format(100*len(ptweets)/len(tweets))) 
    ntweets = [tweet for tweet in tweets if tweet['sentiment'] == 'negative'] 
    print("Neutral tweets percentage: {} %".format(100*len(ntweets)/len(tweets))) 
    print("Negative tweets percentage: {} % \ ".format(100*(len(tweets) - len(ntweets) - len(ptweets))/len(tweets))) 
	
    a=100*len(ptweets)/len(tweets)
    b=100*len(ntweets)/len(tweets)
    c=((100*(len(tweets) - len(ntweets) - len(ptweets))/len(tweets)))
  
    # printing first 5 positive tweets 
   # print("\n\nPositive tweets:") 
    #for tweet in ptweets[:10]:
        #print('------------------------------------------------------')
       # print(tweet['text']) 
  
    # printing first 5 negative tweets 
    #print("\n\nNegative tweets:") 
   # for tweet in ntweets[:10]:
       # print('-------------------------------------------------------')
       # print(tweet['text'])
       # 

    sys.stdout.flush() 
		
    import matplotlib.pyplot as plt
    plt.figure(figsize=[5,5])
    labels=["positive","neutral","negative"]
    values=[a,b,c]
    plt.pie(values,labels=labels)
    plt.show()


    
  
if __name__ == "__main__": 
    main() 
