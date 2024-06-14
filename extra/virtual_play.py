import mido
import time
import rtmidi
import argparse
# https://mido.readthedocs.io/en/stable/

# https://mido.readthedocs.io/en/stable/files/midi.html#iterating-over-messages
# available_ports = midiout.get_ports()

midi_instruments = {1 : "Acoustic Grand Piano", 
    2 : "Bright Acoustic Piano",
    3 : "Electric Grand Piano",
    4 : "Honky-tonk Piano", 
    5 : "Electric Piano 1",
    6 : "Electric Piano 2", 
    7 : "Harpsichord",
    8 : "Clavinet",
    9 : "Celesta",
    10 : "Glockenspiel", 
    11 : "Music Box", 
    12 : "Vibraphone", 
    13 : "Marimba", 
    14 : "Xylophone", 
    15 : "Tubular Bells", 
    16 : "Dulcimer or Santoor", 
    17 : "Drawbar Organ or Organ 1", 
    18 : "Percussive Organ or Organ 2", 
    19 : "Rock Organ or Organ 3", 
    20 : "Church Organ", 
    21 : "Reed Organ", 
    22 : "Accordion", 
    23 : "Harmonica", 
    24 : "Bandoneon or Tango Accordion", 
    25 : "Acoustic Guitar (nylon)", 
    26 : "Acoustic Guitar (steel)", 
    27 : "Electric Guitar (jazz)", 
    28 : "Electric Guitar (clean, often chorused, resembling a Stratocaster run through a Roland Jazz Chorus amplifier)", 
    29 : "Electric Guitar (muted)", 
    30 : "Electric Guitar (overdrive)", 
    31 : "Electric Guitar (distortion)", 
    32 : "Electric Guitar (harmonics)", 
    33 : "Acoustic Bass", 
    34 : "Electric Bass (finger)", 
    35 : "Electric Bass (picked)", 
    36 : "Electric Bass (fretless)", 
    37 : "Slap Bass 1", 
    38 : "Slap Bass 2", 
    39 : "Synth Bass 1", 
    40 : "Synth Bass 2", 
    41 : "Violin", 
    42 : "Viola", 
    43 : "Cello", 
    44 : "Contrabass", 
    45 : "Tremolo Strings", 
    46 : "Pizzicato Strings", 
    47 : "Orchestral Harp", 
    48 : "Timpani", 
    49 : "String Ensemble 1 (often in marcato)", 
    50 : "String Ensemble 2 (slower attack than String Ensemble 1)", 
    51 : "Synth Strings 1", 
    52 : "Synth Strings 2", 
    53 : "Choir Aahs", 
    54 : "Voice Oohs (or Doos)", 
    55 : "Synth Voice or Synth Choir", 
    56 : "Orchestra Hit", 
    57 : "Trumpet", 
    58 : "Trombone", 
    59 : "Tuba", 
    60 : "Muted Trumpet", 
    61 : "French Horn", 
    62 : "Brass Section", 
    63 : "Synth Brass 1", 
    64 : "Synth Brass 2", 
    65 : "Soprano Sax", 
    66 : "Alto Sax", 
    67 : "Tenor Sax", 
    68 : "Baritone Sax", 
    69 : "Oboe", 
    70 : "English Horn", 
    71 : "Bassoon", 
    72 : "Clarinet", 
    73 : "Piccolo", 
    74 : "Flute", 
    75 : "Recorder", 
    76 : "Pan Flute", 
    77 : "Blown bottle", 
    78 : "Shakuhachi", 
    79 : "Whistle", 
    80 : "Ocarina", 
    81 : "Lead 1 (square, often chorused)", 
    82 : "Lead 2 (sawtooth or saw, often chorused)", 
    83 : "Lead 3 (calliope, usually resembling a woodwind)", 
    84 : "Lead 4 (chiff)", 
    85 : "Lead 5 (charang, a guitar-like lead)", 
    86 : "Lead 6 (voice, derived from 'synth voice' with faster attack)", 
    87 : "Lead 7 (fifths)", 
    88 : "Lead 8 (bass and lead or solo lead or sometimes mistakenly called 'brass and lead')", 
    89 : "Pad 1 (new age, pad stacked with a bell, often derived from 'Fantasia' patch from Roland D-50)", 
    90 : "Pad 2 (warm, a mellower pad with slow attack)", 
    91 : "Pad 3 (polysynth or poly, a saw-like percussive pad resembling an early 1980s polyphonic synthesizer)", 
    92 : "Pad 4 (choir, identical to 'synth voice' with longer decay)", 
    93 : "Pad 5 (bowed glass or bowed, a sound resembling a glass harmonica)", 
    94 : "Pad 6 (metallic, often created from a piano or guitar sample played with the attack removed)", 
    95 : "Pad 7 (halo, choir-like pad, often with a filter effect)", 
    96 : "Pad 8 (sweep, pad with a pronounced 'wah' filter effect)", 
    97 : "FX 1 (rain, a bright pluck with echoing pulses that decreases in pitch)", 
    98 : "FX 2 (soundtrack, a bright perfect fifth pad)", 
    99 : "FX 3 (crystal, a synthesized bell sound)", 
    100 : "FX 4 (atmosphere, usually a classical guitar-like sound)", 
    101 : "FX 5 (brightness, bright pad stacked with choir or bell)", 
    102 : "FX 6 (goblins, a slow-attack pad with chirping or murmuring sounds)", 
    103 : "FX 7 (echoes or echo drops, similar to 'rain')", 
    104 : "FX 8 (sci-fi or star theme, usually an electric guitar-like pad)", 
    105 : "Sitar", 
    106 : "Banjo", 
    107 : "Shamisen", 
    108 : "Koto", 
    109 : "Kalimba", 
    110 : "Bag pipe", 
    111 : "Fiddle", 
    112 : "Shanai", 
    113 : "Tinkle Bell", 
    114 : "Agogô or cowbell", 
    115 : "Steel Drums", 
    116 : "Woodblock", 
    117 : "Taiko Drum or Surdo", 
    118 : "Melodic Tom", 
    119 : "Synth Drum (a synthesized tom-tom derived from Simmons electronic drum)", 
    120 : "Reverse Cymbal", 
    121 : "Guitar Fret Noise", 
    122 : "Breath Noise", 
    123 : "Seashore", 
    124 : "Bird Tweet", 
    125 : "Telephone Ring", 
    126 : "Helicopter", 
    127 : "Applause", 
    128 : "Gunshot"
}

def print_details(filename) :
    f = mido.MidiFile(filename)

    print(f"Number of tracks: {len(f.tracks)}")

    for i, track in enumerate(f.tracks) :
        print(f"Track {i}: {track[0].name}", )
        print(f"   Time signature {track[1].numerator}/{track[1].denominator}")
        print(f"   Key signature {track[2].key}")

        channels = {control.channel for control in track if not control.is_meta}

        for c in channels :
            instruments = {control.program for control in track if control.type == "program_change" and control.channel == c}

            print(f"   Instruments in channel {c}: {[midi_instruments[j] for j in instruments]}")

        

def play_file(filename, channels) :
    midi_file = mido.MidiFile(filename)
    if len(channels) == 0 :

        channels = {control.channel for control in track if not control.is_meta}

    input("Waiting for command")

    for msg in midi_file:
        
        time.sleep(msg.time)
        if not msg.is_meta and msg.channel in channels:
            if msg.type == "note_on" : 
                if msg.velocity == 0 :
                    midiout.send_message([0x80, msg.note, 0])
                else :
                    midiout.send_message([0x90, msg.note, msg.velocity])
                # time.sleep(msg.time)
                


            # try: 
            #     print(msg.type)
                

            # except :
            #     print("")

if __name__ == "__main__" :

    parser = argparse.ArgumentParser(
                        prog='ProgramName',
                        description='What the program does',
                        epilog='Text at the bottom of help')

    parser.add_argument('filename')           # positional argument
    parser.add_argument('-c', '--channels', nargs='+', help='<Required> Set flag')
    parser.add_argument('-v', '--verbose',
                        action='store_true')  # on/off flag

    args = parser.parse_args()

    if args.verbose :
        print_details(args.filename)

    if 'mid' in args.filename :
        midiout = rtmidi.MidiOut()
        midiout.open_virtual_port("Yapsmi Vitrual controller")
        play_file(args.filename, channels = {int(i) for i in args.channels}) 
        del midiout
  