n = float(input('please enter your number: '))
if n > 0 and n % 2 == 0:
    print("your number is positive and even")
elif n > 0 and n % 2 == 1:
    print("your number is positive and odd")
elif n < 0 and n % 2 == 0:
    print('your number is negative and even')
elif n < 0 and n % 2 == 1:
    print('your number is negative and odd')
elif n == 0:
    print('dont play games')
if n != int(n):
    print('this is not a valid input ')