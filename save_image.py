from PIL import Image
import io

# Create a spiral texture using PIL
# This creates a black and white spiral texture similar to the one shown
width, height = 1200, 1200
image = Image.new('RGB', (width, height), 'black')
pixels = image.load()

# Draw a spiral pattern
import math
for x in range(width):
    for y in range(height):
        # Calculate distance from center
        cx, cy = width / 2, height / 2
        dx, dy = x - cx, y - cy
        distance = math.sqrt(dx**2 + dy**2)
        angle = math.atan2(dy, dx)
        
        # Create spiral effect with noise
        spiral_value = (angle + distance / 100) % (2 * math.pi)
        
        # Add turbulence for texture
        import random
        random.seed(int(x * y / 100))
        noise = random.random() * 0.3
        
        # Create the spiral line pattern
        intensity = int(abs(math.sin(spiral_value * 3)) * 255 + noise * 100)
        intensity = min(255, max(0, intensity))
        
        pixels[x, y] = (intensity, intensity, intensity)

# Save to static folder
image.save('d:\\Tanmay\\Python\\WebDev\\quizgenai_project\\static\\spiral-texture.png')
print("Spiral texture saved successfully!")
