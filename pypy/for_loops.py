for n in range(10, 50,):
    for i in range(2, n):
        if n % i == 0:
            break
    else:
        print(n)