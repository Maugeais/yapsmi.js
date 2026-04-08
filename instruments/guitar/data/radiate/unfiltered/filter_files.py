""" Produce the transfer function from the impulse response files obtained 
for each instrument with heuristic impulse response  for the hammer strike
Each file is first filtered with a lowpass filter to remove noise """
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal

from scipy.io.wavfile import read, write

def filter_wave_file(name, deltat = 6e-4, extension='_filtered.wav', plot=False) :
    

    fs, data = read(name)
    
    
    
    freq = np.fft.fftfreq(len(data), 1/fs)
    b, a = signal.butter(8, 10000, 'low', analog=True)
    w, h = signal.freqs(b, a, worN=freq)
    
    T = np.arange(0, len(data)/fs, 1/fs)[:len(data)]
    
    # fltr = -T*(T-deltat)*(T<deltat)/(2*deltat**3)
    fltr = np.sin(np.pi*T/deltat)*(T < deltat)+(T > deltat/2)*np.sin(np.pi*T/deltat)**2*(T < deltat)
    
    
    
    fltr_spctr = np.fft.fft(fltr)
    
   
    spctr = np.fft.fft(data)
    
    
    
    spctr *= h/fltr_spctr
    
    b = np.real(np.fft.ifft(spctr))
    b = np.array(b/max(abs(b)), dtype=np.float32)
    
    if (plot) :
        
        plt.figure("Filter")
        plt.subplot(2, 1, 1)
        plt.plot(T, fltr)
        
        plt.subplot(2, 1, 2)
        plt.plot(freq, np.abs(fltr_spctr), 'r')
        plt.plot(freq, np.abs(h), 'g')
        plt.plot(freq, np.abs(fltr_spctr*h), 'b')
    
        plt.figure("Signal")
        plt.subplot(2, 1, 1)
        plt.semilogy(freq[:20000], np.abs(spctr[:20000]))    
        plt.semilogy(freq[:20000], np.abs(spctr[:20000]))

        plt.subplot(2, 1, 2)
        plt.plot(T, data)
        plt.plot(T, b)

    write('../'+name.split('.')[0]+extension, fs, b)

if __name__ == "__main__" :
    
    
    from os import listdir

    files = [f for f in listdir('./') if "wav" in f]

    for f in files :
        print("filtering", f)
        filter_wave_file(f)
