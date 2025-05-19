// DOM elements
const display = document.getElementById('display');
const lyricsDisplay = document.getElementById('lyrics-display');
const lyricsText = document.getElementById('lyrics-text');
const loveMusic = document.getElementById('love-music');

// Ensure audio is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Force audio preload
    loveMusic.load();
    console.log("Audio element loaded");
});

// Variables to track calculation state
let isCalculationDone = false;
// Complete lyrics in sequence
const lyricsSequence = [
    "ikaw lang at ikaw",
    "ang sinisigaw",
    "ng puso kong di mapakali",
    "ikaw lang at ikaw",
    "ang sinisigaw",
    "pag ibig ko sana mapansin"
];

// Music duration settings (seconds)
const musicStartTime = 196; // 3:16
const musicDuration = 16;   // 16 seconds total (3:16 to 3:32)
let lyricTimeouts = [];

// Function to append characters to the display
function appendToDisplay(value) {
    if (isCalculationDone) {
        display.value = '';
        isCalculationDone = false;
        hideLyrics();
    }
    display.value += value;
}

// Function to clear the display
function clearDisplay() {
    display.value = '';
    hideLyrics();
}

// Function to delete the last character
function deleteLastChar() {
    display.value = display.value.slice(0, -1);
}

// Function to calculate the result
function calculate() {
    try {
        // Store the expression for display
        const expression = display.value;
        
        // Check if the display has content
        if (expression.trim() === '') {
            return;
        }
        
        // Calculate the result but don't display it
        let result = eval(expression);
        
        // Clear the display to show only lyrics
        display.value = '';
        
        // Show lyrics and play music
        showLyrics();
        playMusic();
        
        // Mark calculation as done
        isCalculationDone = true;
    } catch (error) {
        display.value = 'Error';
        setTimeout(clearDisplay, 1000);
    }
}

// Function to show lyrics with animation
function showLyrics() {
    // Clear any existing timeouts first
    lyricTimeouts.forEach(timeout => clearTimeout(timeout));
    lyricTimeouts = [];
    
    // Make sure the display is visible and active
    lyricsDisplay.classList.add('active');
    
    // Set up the timing for each lyric part (total 16 seconds)
    const timePerPart = musicDuration / lyricsSequence.length * 1000; // in milliseconds
    
    // Display each part of the lyrics at the right time
    lyricsSequence.forEach((lyric, index) => {
        // Schedule each lyric part
        const timeout = setTimeout(() => {
            // Only show if calculation is still active
            if (isCalculationDone) {
                showLyricPart(lyric);
                console.log(`Showing lyric ${index+1}: ${lyric}`);
            }
        }, index * timePerPart);
        
        lyricTimeouts.push(timeout);
    });
    
    // Add a final timeout to show the credit without affecting the lyrics timing
    const creditTimeout = setTimeout(() => {
        if (isCalculationDone) {
            // Add a small credit text at the end
            showCredit();
        }
    }, musicDuration * 950); // Just before the music ends
    
    lyricTimeouts.push(creditTimeout);
}

// Function to display a single part of the lyrics
function showLyricPart(lyricText) {
    // Set the text content
    lyricsText.textContent = lyricText;
    
    // Reset font size for lyrics
    lyricsText.style.fontSize = "1.5rem";
    
    // Reset animation
    lyricsText.style.animation = 'none';
    
    // Force reflow to restart animation
    void lyricsText.offsetWidth;
    
    // Start animation
    const animDuration = (musicDuration / lyricsSequence.length) - 0.1;
    lyricsText.style.animation = `textFade ${animDuration}s ease-in-out`;
}

// Function to show the credit at the end
function showCredit() {
    // Set smaller font size for credit text
    lyricsText.style.fontSize = "1.2rem";
    
    // Show credit text
    lyricsText.textContent = "BY HANS";
    
    // Reset animation
    lyricsText.style.animation = 'none';
    void lyricsText.offsetWidth;
    
    // Use faster fade-in but stay visible
    lyricsText.style.animation = `creditFade 1.4s ease-in forwards`;
}

// Function to hide lyrics
function hideLyrics() {
    lyricsDisplay.classList.remove('active');
    stopMusic();
    
    // Clear all pending timeouts
    lyricTimeouts.forEach(timeout => clearTimeout(timeout));
    lyricTimeouts = [];
}

// Function to play music
function playMusic() {
    // Start at 3:16 (196 seconds)
    loveMusic.currentTime = musicStartTime;
    
    // Ensure volume is at maximum
    loveMusic.volume = 1.0;
    
    // Play the audio
    loveMusic.play().catch(error => {
        console.error("Audio playback failed:", error);
    });
    
    // Set a timeout to stop the music at 3:32 (after 16 seconds)
    const musicEndTimeout = setTimeout(() => {
        if (isCalculationDone) {
            // Fade out instead of abrupt stop
            const fadeOut = setInterval(() => {
                if (loveMusic.volume > 0.1) {
                    loveMusic.volume -= 0.1;
                } else {
                    clearInterval(fadeOut);
                    stopMusic();
                }
            }, 100);
        }
    }, musicDuration * 1000);
    
    lyricTimeouts.push(musicEndTimeout);
}

// Function to stop music
function stopMusic() {
    loveMusic.pause();
    loveMusic.currentTime = musicStartTime; // Reset to 3:16
    loveMusic.volume = 1.0;      // Reset volume to full
}

// Add keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    // Handle numeric keys and operators
    if (/[\d+\-*/.%]/.test(key)) {
        appendToDisplay(key);
    } 
    // Handle Enter key as equals
    else if (key === 'Enter') {
        calculate();
    } 
    // Handle Escape key as clear
    else if (key === 'Escape') {
        clearDisplay();
    } 
    // Handle Backspace key
    else if (key === 'Backspace') {
        deleteLastChar();
    }
});
