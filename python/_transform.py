import pandas as pd
from sqlalchemy import text

def transform_data(code, df):
    local_vars = {"df": df, "text": text}
    
    exec(code, {}, local_vars)
    
    return local_vars['df']
