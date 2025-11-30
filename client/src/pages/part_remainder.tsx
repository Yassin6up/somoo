
// Post Card Component
function PostCard({
    post,
    groupId,
    currentUserId,
    getMemberInfo,
    checkIsLeader,
    commentInputs,
    setCommentInputs,
    commentImages,
    setCommentImages,
    expandedPosts,
    setExpandedPosts,
    toast,
    detectUrls,
    handleImageUpload,
    groupTasks,
    canInteract
}: any) {
    const author = getMemberInfo(post.authorId);
    const isAuthorLeader = checkIsLeader(post.authorId);

    // Fetch comments
    const { data: comments = [] } = useQuery<PostComment[]>({
        queryKey: [`/api/posts/${post.id}/comments`],
        queryFn: async () => {
            const response = await fetch(`/api/posts/${post.id}/comments`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) return [];
            return response.json();
        },
    });

    // Fetch reactions
    const { data: reactionsData, refetch: refetchReactions } = useQuery({
        queryKey: [`/api/posts/${post.id}/reactions`],
        queryFn: async () => {
            const response = await fetch(`/api/posts/${post.id}/reactions`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) return { reactions: [], userReaction: null };
            return response.json();
        },
    });

    const reactions = reactionsData?.reactions || [];
    const userReaction = reactionsData?.userReaction;

    // Toggle reaction mutation
    const toggleReactionMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest(`/api/posts/${post.id}/reactions`, "POST", { type: 'like' });
        },
        onSuccess: () => {
            refetchReactions();
        },
    });

    // Create comment mutation
    const createCommentMutation = useMutation({
        mutationFn: async ({ content, imageUrl }: { content: string; imageUrl: string | null }) => {
            return await apiRequest(`/api/posts/${post.id}/comments`, "POST", {
                content,
                imageUrl,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
            queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
            setCommentInputs((prev: Record<string, string>) => ({ ...prev, [post.id]: "" }));
            setCommentImages((prev: Record<string, string>) => {
                const newState = { ...prev };
                delete newState[post.id];
                return newState;
            });

            const newExpanded = new Set(expandedPosts);
            newExpanded.add(post.id);
            setExpandedPosts(newExpanded);

            toast({
                title: "تم بنجاح",
                description: "تم إرسال تعليقك بنجاح",
            });
        },
        onError: (error: any) => {
            const errorMessage = error?.message || "حدث خطأ أثناء إرسال التعليق";
            toast({
                title: "خطأ",
                description: errorMessage,
                variant: "destructive",
            });
        },
    });

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const content = commentInputs[post.id];
        const imageUrl = commentImages[post.id];

        if (!imageUrl) {
            toast({
                title: "صورة مطلوبة",
                description: "يجب إرفاق صورة مع التعليق لإثبات المهمة",
                variant: "destructive",
            });
            return;
        }

        createCommentMutation.mutate({
            content: content || "",
            imageUrl: imageUrl || null,
        });
    };

    const handleShare = () => {
        const url = `${window.location.origin}/groups/${groupId}/community?postId=${post.id}`;
        navigator.clipboard.writeText(url).then(() => {
            toast({
                title: "تم نسخ الرابط",
                description: "تم نسخ رابط المنشور إلى الحافظة",
            });
        }).catch(() => {
            toast({
                title: "خطأ",
                description: "فشل نسخ الرابط",
                variant: "destructive",
            });
        });
    };

    const handleDeletePost = async () => {
        if (confirm("هل أنت متأكد من حذف هذا المنشور؟")) {
            try {
                await apiRequest(`/api/posts/${post.id}`, "DELETE");
                toast({
                    title: "تم الحذف",
                    description: "تم حذف المنشور بنجاح",
                });
                queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'posts'] });
            } catch (err) {
                toast({
                    title: "خطأ",
                    description: "فشل حذف المنشور",
                    variant: "destructive",
                });
            }
        }
    };

    const handlePinPost = async () => {
        try {
            await apiRequest(`/api/posts/${post.id}/pin`, "POST");
            toast({
                title: post.isPinned ? "تم إلغاء التثبيت" : "تم تثبيت المنشور",
            });
            queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'posts'] });
        } catch (err) {
            toast({
                title: "خطأ",
                description: "فشل تثبيت المنشور",
                variant: "destructive",
            });
        }
    };

    const [showReportDialog, setShowReportDialog] = useState(false);
    const [reportReason, setReportReason] = useState("");

    const handleReportPost = async () => {
        if (!reportReason.trim()) {
            toast({
                title: "خطأ",
                description: "يجب إدخال سبب التقرير",
                variant: "destructive",
            });
            return;
        }
        try {
            await apiRequest(`/api/posts/${post.id}/report`, "POST", { reason: reportReason });
            toast({
                title: "تم إرسال التقرير",
                description: "شكراً لمساعدتك في الحفاظ على سلامة المجموعة",
            });
            setShowReportDialog(false);
            setReportReason("");
        } catch (err) {
            toast({
                title: "خطأ",
                description: "فشل إرسال التقرير",
                variant: "destructive",
            });
        }
    };

    // Task detection
    const taskTitle = post.taskTitle;
    const taskReward = post.taskReward;
    const hasTask = post.isTaskPost === true || !!(taskTitle && taskReward);

    // Completion detection
    let relatedTasks: any[] = [];
    if (hasTask && Array.isArray(groupTasks)) {
        relatedTasks = groupTasks.filter((t: any) => {
            if (t.taskUrl && typeof t.taskUrl === 'string' && t.taskUrl.includes(post.id)) return true;
            if (!t.taskUrl && taskTitle && t.title && t.title.trim().toLowerCase() === taskTitle.trim().toLowerCase()) return true;
            return false;
        });
    }
    const totalTasks = relatedTasks.length;
    const approvedCount = relatedTasks.filter(t => t.status === 'approved').length;
    const allApproved = totalTasks > 0 && approvedCount === totalTasks;

    return (
        <Card
            id={`post-${post.id}`}
            className={`border border-gray-200 rounded-lg ${allApproved
                ? "bg-green-50 border-green-300"
                : hasTask
                    ? "bg-blue-50 border-blue-300"
                    : "bg-white"
                }`}>
            <CardContent className="p-4">
                {/* Pinned Badge */}
                {post.isPinned && (
                    <div className="mb-3">
                        <Badge className="bg-amber-100 text-amber-800 px-3 py-1">
                            <Bookmark className="h-3 w-3 ml-1" />
                            مثبت
                        </Badge>
                    </div>
                )}

                {/* Task / Completion Badges */}
                {hasTask && !allApproved && (
                    <div className="mb-3">
                        <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                            <Briefcase className="h-3 w-3 ml-1" /> المهمة تفاعلية
                        </Badge>
                    </div>
                )}
                {allApproved && (
                    <div className="mb-3">
                        <Badge className="bg-green-100 text-green-800 px-3 py-1">
                            <Award className="h-3 w-3 ml-1" /> المهمة مكتملة
                        </Badge>
                    </div>
                )}

                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-gray-200">
                            <AvatarImage src={author?.profileImage} />
                            <AvatarFallback className="bg-gray-100 text-gray-600">
                                {author?.fullName?.substring(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{author?.fullName}</span>
                                {isAuthorLeader && (
                                    <Badge className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5">
                                        قائد
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ar })}</span>
                                <span>•</span>
                                <Globe className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {isAuthorLeader && (
                                <>
                                    <DropdownMenuItem onClick={handlePinPost} className="cursor-pointer">
                                        <Bookmark className="w-4 h-4 ml-2" />
                                        {post.isPinned ? "إلغاء التثبيت" : "تثبيت المنشور"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDeletePost} className="cursor-pointer text-red-600">
                                        <Trash2 className="w-4 h-4 ml-2" />
                                        حذف المنشور
                                    </DropdownMenuItem>
                                </>
                            )}
                            {currentUserId !== post.authorId && (
                                <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="cursor-pointer text-orange-600">
                                    <Flag className="w-4 h-4 ml-2" />
                                    الإبلاغ عن المنشور
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Task Info Card */}
                {hasTask && taskTitle && (
                    <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                                    <Zap className="w-4 h-4 text-gray-600" />
                                    {taskTitle}
                                </h4>
                                {taskReward && (
                                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded w-fit">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <span className="font-medium text-green-700">
                                            المكافأة: ${taskReward}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {hasTask && totalTasks > 0 && (
                                <div className="flex flex-col items-end gap-1">
                                    <div className="text-xs text-gray-600">المهام: {totalTasks}</div>
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${allApproved ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${(approvedCount / totalTasks) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                        {approvedCount} / {totalTasks} مكتملة
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Post Content */}
                <div className="mb-3">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
                        {detectUrls(post.content)}
                    </p>
                </div>

                {/* Post Image */}
                {post.imageUrl && (
                    <div className="mb-3 bg-gray-50 rounded-lg overflow-hidden">
                        <img
                            src={post.imageUrl}
                            alt="Post content"
                            className="w-full max-h-80 object-contain mx-auto"
                        />
                    </div>
                )}

                {/* Post Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                        {reactions.length > 0 && (
                            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                <ThumbsUp className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-gray-700 font-medium">{reactions.length}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className="hover:underline font-medium"
                            onClick={() => {
                                const newExpanded = new Set(expandedPosts);
                                if (newExpanded.has(post.id)) {
                                    newExpanded.delete(post.id);
                                } else {
                                    newExpanded.add(post.id);
                                }
                                setExpandedPosts(newExpanded);
                            }}
                        >
                            {comments.length} تعليق
                        </button>
                    </div>
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between border-t border-b border-gray-200 py-2 mb-3">
                    <Button
                        variant="ghost"
                        className={`flex-1 gap-2 hover:bg-gray-50 ${userReaction ? 'text-blue-600' : 'text-gray-600'}`}
                        onClick={() => toggleReactionMutation.mutate()}
                    >
                        <ThumbsUp className={`w-4 h-4 ${userReaction ? 'fill-blue-600' : ''}`} />
                        <span className="text-sm">أعجبني</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex-1 gap-2 text-gray-600 hover:bg-gray-50"
                        onClick={() => {
                            const input = document.getElementById(`comment-input-${post.id}`);
                            input?.focus();
                        }}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">تعليق</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex-1 gap-2 text-gray-600 hover:bg-gray-50"
                        onClick={handleShare}
                    >
                        <Share className="w-4 h-4" />
                        <span className="text-sm">مشاركة</span>
                    </Button>
                </div>

                {/* Report Dialog */}
                {showReportDialog && (
                    <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200 space-y-2">
                        <h4 className="font-semibold text-red-900 text-sm">الإبلاغ عن المنشور</h4>
                        <Textarea
                            placeholder="اشرح سبب الإبلاغ..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="text-sm min-h-[80px]"
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={handleReportPost}
                            >
                                إرسال التقرير
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setShowReportDialog(false);
                                    setReportReason("");
                                }}
                            >
                                إلغاء
                            </Button>
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                <div className="space-y-3">
                    {/* Comments List */}
                    {expandedPosts.has(post.id) && comments.length > 0 && (
                        <div className="space-y-3">
                            {comments.map((comment) => {
                                const commentAuthor = getMemberInfo(comment.authorId);
                                return (
                                    <div key={comment.id} className="flex gap-2">
                                        <Avatar className="w-8 h-8 border border-gray-200">
                                            <AvatarImage src={commentAuthor?.profileImage} />
                                            <AvatarFallback className="text-xs bg-gray-100">
                                                {commentAuthor?.fullName?.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="bg-gray-50 rounded-lg px-3 py-2 inline-block">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-sm text-gray-900">{commentAuthor?.fullName}</p>
                                                    {comment.isTaskCompleted && (
                                                        <Badge className="bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                                                            <Award className="w-3 h-3 ml-1" />
                                                            تم إكمال المهمة
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-800">{comment.content}</p>
                                                {comment.taskCompletionReward && (
                                                    <div className="mt-2 bg-green-50 px-2 py-1 rounded flex items-center gap-1 w-fit">
                                                        <DollarSign className="w-3 h-3 text-green-600" />
                                                        <span className="text-xs font-medium text-green-700">كسبت: ${comment.taskCompletionReward}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {comment.imageUrl && (
                                                <img
                                                    src={comment.imageUrl}
                                                    alt="Comment attachment"
                                                    className="mt-2 rounded-lg max-h-32 object-cover border border-gray-200"
                                                />
                                            )}
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 px-1">
                                                <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ar })}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Comment Input */}
                    {canInteract && (
                        <div className="flex gap-2 items-start">
                            <Avatar className="w-8 h-8 border border-gray-200">
                                <AvatarImage src={getMemberInfo(currentUserId)?.profileImage} />
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                    {getMemberInfo(currentUserId)?.fullName?.substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <form onSubmit={handleCommentSubmit} className="relative">
                                    <Input
                                        id={`comment-input-${post.id}`}
                                        placeholder={hasTask && !allApproved ? "أرفق صورة لإثبات المهمة..." : "اكتب تعليقاً..."}
                                        value={commentInputs[post.id] || ""}
                                        onChange={(e) => setCommentInputs((prev: Record<string, string>) => ({ ...prev, [post.id]: e.target.value }))}
                                        className="bg-white border-gray-300 rounded-lg pr-4 pl-20 py-2 text-sm"
                                    />
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            type="button"
                                            className="p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded transition-colors"
                                            onClick={() => document.getElementById(`comment-image-${post.id}`)?.click()}
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                        <input
                                            id={`comment-image-${post.id}`}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const url = await handleImageUpload(file, 'comment', post.id);
                                                    if (url) {
                                                        setCommentImages((prev: Record<string, string>) => ({ ...prev, [post.id]: url }));
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={(hasTask && !allApproved && !commentImages[post.id]) || createCommentMutation.isPending}
                                            className="p-1 text-white bg-gray-900 hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
                                            title={hasTask && !allApproved && !commentImages[post.id] ? "يجب إرفاق صورة أولاً" : "إرسال"}
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                                {commentImages[post.id] && (
                                    <div className="relative mt-2 inline-block">
                                        <img
                                            src={commentImages[post.id]}
                                            alt="Attachment"
                                            className="h-20 rounded-lg border border-gray-200"
                                        />
                                        <button
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                            onClick={() => setCommentImages((prev: Record<string, string>) => {
                                                const newState = { ...prev };
                                                delete newState[post.id];
                                                return newState;
                                            })}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Members List Component
function MembersList({ members, getMemberInfo, isOnline, checkIsLeader }: { members: GroupMember[], getMemberInfo: any, isOnline: any, checkIsLeader: any }) {
    const [, navigate] = useLocation();
    const currentUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")!)
        : null;
    const userType = localStorage.getItem("userType");

    // Get first 8 members
    const displayedMembers = members.slice(0, 8);

    return (
        <Card className="border border-gray-200 rounded-lg">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">أعضاء المجموعة</h3>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800 px-2 py-1">
                        {members.length}
                    </Badge>
                </div>

                <div className="space-y-3">
                    {displayedMembers.map((member) => {
                        const info = getMemberInfo(member.freelancerId);
                        if (!info) return null;

                        const online = isOnline(info.lastSeen);

                        return (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="relative">
                                        <Avatar className="w-9 h-9 border border-gray-200">
                                            <AvatarImage src={info.profileImage} />
                                            <AvatarFallback className="text-xs bg-gray-100">
                                                {info.fullName?.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {online && (
                                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-900">{info.fullName}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            {checkIsLeader(member.freelancerId) ? (
                                                <>
                                                    <Star className="w-3 h-3 text-yellow-500" />
                                                    قائد المجموعة
                                                </>
                                            ) : (
                                                info.jobTitle || 'عضو'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {currentUser?.id !== member.freelancerId && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => navigate(`/chat/${member.freelancerId}`)}
                                        className="opacity-0 hover:opacity-100 transition-opacity"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {members.length > 8 && (
                    <Button variant="ghost" className="w-full mt-3 text-gray-600 hover:text-gray-900 text-sm font-medium">
                        عرض كل الأعضاء ({members.length})
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
