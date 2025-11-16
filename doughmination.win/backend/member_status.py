import json
import os
from typing import Optional, Dict, List
from datetime import datetime, timezone
from pathlib import Path

# Define data directory
DATA_DIR = Path("dough-data")
MEMBER_STATUS_FILE = DATA_DIR / "member_status.json"

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)

def get_all_statuses() -> Dict[str, Dict]:
    """Get all member statuses"""
    if not os.path.exists(MEMBER_STATUS_FILE):
        return {}
    
    with open(MEMBER_STATUS_FILE, "r") as f:
        return json.load(f)

def save_all_statuses(statuses: Dict[str, Dict]):
    """Save all member statuses to file"""
    with open(MEMBER_STATUS_FILE, "w") as f:
        json.dump(statuses, f, indent=2)

def get_member_status(member_identifier: str) -> Optional[Dict]:
    """Get status for a specific member by ID or name"""
    statuses = get_all_statuses()
    return statuses.get(member_identifier)

def set_member_status(member_identifier: str, status_text: str, emoji: Optional[str] = None) -> Dict:
    """
    Set or update status for a member
    
    Args:
        member_identifier: Member ID or name
        status_text: The status message
        emoji: Optional emoji to display with the status
    
    Returns:
        The created/updated status object
    """
    statuses = get_all_statuses()
    
    status_obj = {
        "text": status_text,
        "emoji": emoji,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    statuses[member_identifier] = status_obj
    save_all_statuses(statuses)
    
    return status_obj

def clear_member_status(member_identifier: str) -> bool:
    """
    Clear status for a member
    
    Returns:
        True if status was found and removed, False otherwise
    """
    statuses = get_all_statuses()
    
    if member_identifier in statuses:
        del statuses[member_identifier]
        save_all_statuses(statuses)
        return True
    
    return False

def enrich_member_with_status(member: Dict) -> Dict:
    """
    Add status information to a member object
    
    Args:
        member: Member dictionary to enrich
    
    Returns:
        Member dictionary with status field added
    """
    member_id = member.get("id")
    member_name = member.get("name")
    
    # Try to find status by ID first, then by name
    status = None
    if member_id:
        status = get_member_status(str(member_id))
    if not status and member_name:
        status = get_member_status(member_name)
    
    return {
        **member,
        "status": status
    }

def enrich_members_with_status(members: List[Dict]) -> List[Dict]:
    """
    Add status information to a list of members
    
    Args:
        members: List of member dictionaries
    
    Returns:
        List of member dictionaries with status fields added
    """
    return [enrich_member_with_status(member) for member in members]

def initialize_status_storage():
    """Initialize the status storage file if it doesn't exist"""
    if not os.path.exists(MEMBER_STATUS_FILE):
        save_all_statuses({})
        print("Initialized member status storage")