import sys 
import re 
import tweepy 
from tweepy import OAuthHandler 
from textblob import TextBlob 
  
class TwitterClient(object):
    ''' 
    Generic Twitter Class for sentiment analysis. 
    '''
    def __init__(self): 
        ''' 
        Class constructor or initialization method. 
        '''
        consumer_key = 'qJ14NxTNj8ndgFFaUc15UjMdY'
        consumer_secret = 'hJYpqfMe7DtfOiINZ1km3feSzxXQcVB9NHojioJhSdKX5nwJGs'
        access_token = '1046088765993701376-2YR1kOo1WxY05QmW49ZUXkQIndlrvy'
        access_token_secret = 'zVWKo6NPDzeAaVgF6cYbTmm9DQzp4TyvbrlP48LS3VAti'
  
        try: 
            self.auth = OAuthHandler(consumer_key, consumer_secret) 
            self.auth.set_access_token(access_token, access_token_secret) 
            self.api = tweepy.API(self.auth) 
        except: 
            print("Error: Authentication Failed") 
  
    def clean_tweet(self, tweet): 
        ''' 
        Utility function to clean tweet text by removing links, special characters 
        using simple regex statements. 
        '''
        return ' '.join(re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)", " ", tweet).split()) 
  
    def get_tweet_sentiment(self, tweet): 
        ''' 
        Utility function to classify sentiment of passed tweet 
        using textblob's sentiment method 
        '''
        analysis = TextBlob(self.clean_tweet(tweet)) 
        if analysis.sentiment.polarity > 0: 
            return 'positive'
        elif analysis.sentiment.polarity == 0: 
            return 'neutral'
        else: 
            return 'negative'
  
    def get_tweets(self, query, count = 10): 
        ''' 
        Main function to fetch tweets and parse them. 
        '''
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
	
    x="modi"
    tweets = api.get_tweets(query = x, count = 2000) 
  
    ptweets = [tweet for tweet in tweets if tweet['sentiment'] == 'positive'] 
    
   
            
    print("Positive tweets percentage: {} %".format(100*len(ptweets)/len(tweets))) 
    ntweets = [tweet for tweet in tweets if tweet['sentiment'] == ['negative'] 
    print("Neutral tweets percentage: {} %".format(100*len(ntweets)/len(tweets))) 
    print("Negative tweets percentage: {} % \ ".format(100*(len(tweets) - len(ntweets) - len(ptweets))/len(tweets))) 
  
    a=100*len(ptweets)/len(tweets)
    b=100*len(ntweets)/len(tweets)
    c=((100*(len(tweets) - len(ntweets) - len(ptweets))/len(tweets)))

    print("\n\nPositive tweets:") 
    for tweet in ptweets[:10]: 
            print(tweet['text'])
            print(' ')
            print('##########################################################################################')
            print(dataToSendBack)
            sys.stdout.flush()

    import matplotlib.pyplot as plt
    plt.figure(figsize=[5,5])
    labels=["positive","negative","neutral"]
    values=[a,b,c]
    plt.pie(values,labels=labels)
    plt.show()
    
            
if __name__ == "__main__": 
    main() 
