import matplotlib.pyplot as plt

a=20
b=80
plt.figure(figsize=[5,5])
labels=["positive","negative"]
values=[20,80]
plt.pie(values,labels=labels)
plt.show()
