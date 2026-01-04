using System;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class LikesRepository(AppDbContext context) : ILikeRepository
{
    public void AddLike(MemberLike like)
    {
        context.Likes.Add(like);
    }

    public void DeleteLike(MemberLike like)
    {
        context.Likes.Remove(like);
    }

    public async Task<IReadOnlyList<string>> GetCurrentMemberLikeIds(string memberId)
    {
        return await context.Likes.Where(l => l.SourceMemberId == memberId).Select(l => l.TargetMemberId).ToListAsync();
    }

    public async Task<MemberLike?> GetMemberLike(string sourceMemberId, string targetMemberId)
    {
        return await context.Likes.FindAsync(sourceMemberId, targetMemberId);
    }

    public async Task<PaginatedResult<Member>> GetMemberLikes(LikesParams likesParams)
    {
        var query = context.Likes.AsQueryable();
        IQueryable<Member> result ;
        switch (likesParams.Predicate)
        {
            case "liked":
              result=  query.Where(l => l.SourceMemberId == likesParams.MemberId)
                .Select(l => l.TargetMember);
                break;
            case "likedBy":
                result= query.Where(l => l.TargetMemberId == likesParams.MemberId)
                       .Select(l => l.SourceMember);
                break;
            default: //mutual
             var likeIds = await GetCurrentMemberLikeIds(likesParams.MemberId);
               result=  query.Where( l => l.TargetMemberId == likesParams.MemberId  && likeIds.Contains(l.SourceMemberId))
                       .Select(l => l.SourceMember);
                break;
        }

        return await PaginationHelper.CreateAsync(result, likesParams.PageNumber, likesParams.PageSize);
    }
}
