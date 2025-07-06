import json
import sys

# Read user code
with open('user_code.py', 'r', encoding='utf-8') as f:
    user_code = f.read()

# Read function name
with open('function_name.txt', 'r', encoding='utf-8') as f:
    function_name = f.read().strip()

# Prepare an isolated namespace
user_namespace = {}

# Execute the user's code in the user_namespace
exec(user_code, user_namespace)

# Read the input passed via command-line
input_args = json.loads(sys.argv[1])

# Ensure function exists
if function_name not in user_namespace or not callable(user_namespace[function_name]):
    raise Exception(f"Function '{function_name}' not found in user_code.py")

# Call the function
result = user_namespace[function_name](*input_args)

# Print result as JSON
print(json.dumps(result))
