using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class LikesController(IUnitOfWork uow) : BaseApiController
    {

        [HttpPost("{targetmemberId}")]
        public async Task<IActionResult> ToggleLike(string targetmemberId)
        {
            var sourceMemberId = User.GetMemberId();

            if (sourceMemberId == targetmemberId) return BadRequest("You cannot like yourself");

            var existingLike = await uow.LikesRepository.GetMemberLike(sourceMemberId, targetmemberId);

            if (existingLike == null)
            {
                var like = new MemberLike
                {
                    SourceMemberId = sourceMemberId,
                    TargetMemberId = targetmemberId
                };
                uow.LikesRepository.AddLike(like);
            }
            else
            {
                uow.LikesRepository.DeleteLike(existingLike);
            }

            if(await uow.Complete()) return Ok();

            return BadRequest("Failed to toggle like");
        }

        [HttpGet("list")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetCurrentMemberLikeIds()
        {
            return Ok(await uow.LikesRepository.GetCurrentMemberLikeIds(User.GetMemberId()));
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResult<Member>>> GetMemberLikes([FromQuery] LikesParams likesParams)
        {
            likesParams.MemberId = User.GetMemberId();
            return Ok(await uow.LikesRepository.GetMemberLikes(likesParams));
        }

    }
}
