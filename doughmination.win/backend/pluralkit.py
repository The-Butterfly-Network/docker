import httpx
import os
from dotenv import load_dotenv
from cache import get_from_cache, set_in_cache

load_dotenv()

BASE_URL = "https://api.pluralkit.me/v2"
TOKEN = os.getenv("SYSTEM_TOKEN")
CACHE_TTL = int(os.getenv("CACHE_TTL", 30))

HEADERS = {
    "Authorization": TOKEN
}

# Special member display names
SPECIAL_DISPLAY_NAMES = {
    "answer": "Answer Machine",
    "system": "Unsure",
    "sleeping": "I am sleeping"
}

async def get_system():
    cache_key = "system"
    if (cached := get_from_cache(cache_key)):
        return cached
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/systems/@me", headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()
        set_in_cache(cache_key, data, CACHE_TTL)
        return data

async def get_members():
    cache_key = "members"
    if (cached := get_from_cache(cache_key)):
        return cached
    
    # Get all members from PluralKit
    base_cache_key = "members_raw"
    if not (cached_raw := get_from_cache(base_cache_key)):
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{BASE_URL}/systems/@me/members", headers=HEADERS)
            resp.raise_for_status()
            cached_raw = resp.json()
            set_in_cache(base_cache_key, cached_raw, CACHE_TTL)
    
    data = cached_raw
    
    # Process special members
    processed_members = []
    for member in data:
        member_name = member.get("name")
        
        # Handle special display names (system -> Unsure, sleeping -> I am sleeping)
        if member_name in SPECIAL_DISPLAY_NAMES:
            # Update the display name but keep everything else the same
            special_member = {
                **member,
                "display_name": SPECIAL_DISPLAY_NAMES[member_name],
                "is_special": True,  # Mark as special for identification
                "original_name": member_name
            }
            processed_members.append(special_member)
        
        # Handle normal members
        else:
            processed_members.append(member)
    
    set_in_cache(cache_key, processed_members, CACHE_TTL)
    return processed_members

async def get_fronters():
    cache_key = "fronters"
    if (cached := get_from_cache(cache_key)):
        return cached
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/systems/@me/fronters", headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()
        
        # Process special members in fronters
        if "members" in data:
            # Get all members for reference
            all_members = await get_members()
            
            processed_fronters = []
            for member in data["members"]:
                # Find the processed member data from our get_members function
                processed_member = None
                for m in all_members:
                    if m.get("id") == member.get("id"):
                        processed_member = m
                        break
                
                if processed_member:
                    # Use the processed member data (which includes special display name handling)
                    processed_fronters.append(processed_member)
                else:
                    # Fallback to original member data
                    processed_fronters.append(member)
            
            data["members"] = processed_fronters
        
        set_in_cache(cache_key, data, CACHE_TTL)
        return data

async def set_front(member_ids):
    """
    Sets the current front to the provided list of member IDs.
    Pass an empty list to clear the front.
    """
    # Clear fronters cache since we're updating it
    cache_key = "fronters"
    set_in_cache(cache_key, None, 0)  # Invalidate cache
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/systems/@me/switches",
            headers=HEADERS,
            json={"members": member_ids}
        )
        if resp.status_code not in (200, 204):
            raise Exception(f"Failed to set front: {resp.status_code} - {resp.text}")

        # If there's a response body, return it, otherwise return None
        return resp.json() if resp.content else None